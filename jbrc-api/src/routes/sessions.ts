import { Hono } from "hono";
import { getSupabase, type SupabaseBindings } from "../lib/supabase";

const MAX_PHOTO_BYTES = 15 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;

const SESSION_VEHICLES_EMBED = "vehicle:vehicles(id,name,brand,scale)";

function flattenSession(row: Record<string, unknown>) {
  const { session_vehicles, ...rest } = row as {
    session_vehicles?: { vehicle: unknown }[];
  };
  return { ...rest, vehicles: (session_vehicles ?? []).map((sv) => sv.vehicle) };
}

export const sessions = new Hono<{ Bindings: SupabaseBindings }>();

sessions.get("/", async (c) => {
  const vehicleId = c.req.query("vehicle_id");
  const supabase = getSupabase(c.env);

  const embed = vehicleId
    ? `session_vehicles!inner(${SESSION_VEHICLES_EMBED})`
    : `session_vehicles(${SESSION_VEHICLES_EMBED})`;

  let query = supabase
    .from("sessions")
    .select(`*, ${embed}`)
    .order("session_date", { ascending: false });

  if (vehicleId) query = query.eq("session_vehicles.vehicle_id", vehicleId);

  const { data, error } = await query;

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data.map(flattenSession));
});

sessions.get("/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from("sessions")
    .select(`*, session_vehicles(${SESSION_VEHICLES_EMBED})`)
    .eq("id", id)
    .single();

  if (error) return c.json({ error: "Session not found" }, 404);
  return c.json(flattenSession(data));
});

sessions.post("/", async (c) => {
  const supabase = getSupabase(c.env);
  const { name, session_date, location, notes, vehicle_ids } =
    await c.req.json();

  const { data: session, error } = await supabase
    .from("sessions")
    .insert({ name, session_date, location, notes })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);

  if (Array.isArray(vehicle_ids) && vehicle_ids.length > 0) {
    const { error: linkError } = await supabase.from("session_vehicles").insert(
      vehicle_ids.map((vehicle_id: string) => ({
        session_id: session.id,
        vehicle_id,
      })),
    );

    if (linkError) {
      await supabase.from("sessions").delete().eq("id", session.id);
      return c.json({ error: linkError.message }, 500);
    }
  }

  return c.json(session, 201);
});

sessions.post("/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);
  const { name, session_date, location, notes, vehicle_ids } =
    await c.req.json();

  const { data, error } = await supabase
    .from("sessions")
    .update({ name, session_date, location, notes })
    .eq("id", id)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);

  if (Array.isArray(vehicle_ids)) {
    const { error: deleteError } = await supabase
      .from("session_vehicles")
      .delete()
      .eq("session_id", id);

    if (deleteError) return c.json({ error: deleteError.message }, 500);

    if (vehicle_ids.length > 0) {
      const { error: insertError } = await supabase
        .from("session_vehicles")
        .insert(
          vehicle_ids.map((vehicle_id: string) => ({
            session_id: id,
            vehicle_id,
          })),
        );

      if (insertError) return c.json({ error: insertError.message }, 500);
    }
  }

  return c.json(data);
});

sessions.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);

  const { data, error } = await supabase
    .from("sessions")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) return c.json({ error: "Session not found" }, 404);

  const objects = await c.env.MEDIA_BUCKET.list({ prefix: `sessions/${id}/` });
  if (objects.objects.length > 0) {
    await c.env.MEDIA_BUCKET.delete(objects.objects.map((object) => object.key));
  }

  return c.json(data);
});

sessions.post("/:id/thumbnail", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);

  const { error: sessionError } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", id)
    .single();

  if (sessionError) return c.json({ error: "Session not found" }, 404);

  const body = await c.req.parseBody();
  const file = body.file;

  if (!(file instanceof File)) {
    return c.json({ error: "Expected a 'file' field with an image" }, 400);
  }

  if (!file.type.startsWith("image/")) {
    return c.json({ error: "File must be an image" }, 400);
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return c.json({ error: "Image must be 15MB or smaller" }, 400);
  }

  const object = await c.env.MEDIA_BUCKET.put(
    `sessions/${id}/thumbnail`,
    file,
    {
      httpMetadata: { contentType: file.type },
    },
  );

  return c.json(
    { key: object.key, size: object.size, etag: object.httpEtag },
    201,
  );
});

sessions.delete("/:id/thumbnail", async (c) => {
  const id = c.req.param("id");
  await c.env.MEDIA_BUCKET.delete(`sessions/${id}/thumbnail`);
  return c.body(null, 204);
});

sessions.get("/:id/media", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from("session_media")
    .select("*")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

sessions.post("/:id/media", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);

  const { error: sessionError } = await supabase
    .from("sessions")
    .select("id")
    .eq("id", id)
    .single();

  if (sessionError) return c.json({ error: "Session not found" }, 404);

  const body = await c.req.parseBody({ all: true });
  const files = (Array.isArray(body.file) ? body.file : [body.file]).filter(
    (value): value is File => value instanceof File,
  );
  const captions = (
    Array.isArray(body.caption) ? body.caption : [body.caption]
  ).filter((value): value is string => typeof value === "string");

  if (files.length === 0) {
    return c.json({ error: "Expected one or more 'file' fields" }, 400);
  }

  for (const file of files) {
    const isVideo = file.type.startsWith("video/");
    if (!isVideo && !file.type.startsWith("image/")) {
      return c.json({ error: `${file.name} must be an image or video` }, 400);
    }
    if (file.size > (isVideo ? MAX_VIDEO_BYTES : MAX_PHOTO_BYTES)) {
      return c.json(
        {
          error: isVideo
            ? `${file.name} must be 50MB or smaller`
            : `${file.name} must be 15MB or smaller`,
        },
        400,
      );
    }
  }

  const rows = files.map((file, i) => {
    const caption = captions[i]?.trim();
    return {
      id: crypto.randomUUID(),
      session_id: id,
      content_type: file.type,
      size_bytes: file.size,
      caption: caption ? caption : null,
    };
  });

  await Promise.all(
    files.map((file, i) =>
      c.env.MEDIA_BUCKET.put(`sessions/${id}/media/${rows[i].id}`, file, {
        httpMetadata: { contentType: file.type },
      }),
    ),
  );

  const { data, error } = await supabase
    .from("session_media")
    .insert(rows)
    .select();

  if (error) {
    await c.env.MEDIA_BUCKET.delete(
      rows.map((row) => `sessions/${id}/media/${row.id}`),
    );
    return c.json({ error: error.message }, 500);
  }

  return c.json(data, 201);
});

sessions.delete("/:id/media/:mediaId", async (c) => {
  const id = c.req.param("id");
  const mediaId = c.req.param("mediaId");
  const supabase = getSupabase(c.env);

  const { error, count } = await supabase
    .from("session_media")
    .delete({ count: "exact" })
    .eq("id", mediaId)
    .eq("session_id", id);

  if (error) return c.json({ error: error.message }, 500);
  if (count === 0) return c.json({ error: "Media not found" }, 404);

  await c.env.MEDIA_BUCKET.delete(`sessions/${id}/media/${mediaId}`);
  return c.body(null, 204);
});
