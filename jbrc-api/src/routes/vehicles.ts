import { Hono } from "hono";
import { getSupabase, type SupabaseBindings } from "../lib/supabase";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_MANUAL_BYTES = 25 * 1024 * 1024;

export const vehicles = new Hono<{ Bindings: SupabaseBindings }>();

vehicles.get("/", async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase.from("vehicles").select("*");

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

vehicles.get("/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return c.json({ error: error.message }, 404);
  return c.json(data);
});

vehicles.post("/", async (c) => {
  const supabase = getSupabase(c.env);
  const { name, brand, scale, notes } = await c.req.json();

  const { data, error } = await supabase
    .from("vehicles")
    .insert({ name, brand, scale, notes })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

vehicles.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);

  const { error: linkError } = await supabase
    .from("vehicle_parts")
    .delete()
    .eq("vehicle_id", id);

  if (linkError) return c.json({ error: linkError.message }, 500);

  const { data, error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) return c.json({ error: "Vehicle not found" }, 404);

  const objects = await c.env.MEDIA_BUCKET.list({ prefix: `vehicles/${id}/` });
  if (objects.objects.length > 0) {
    await c.env.MEDIA_BUCKET.delete(objects.objects.map((object) => object.key));
  }

  return c.json(data);
});

vehicles.post("/:id/thumbnail", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);

  const { error: vehicleError } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", id)
    .single();

  if (vehicleError) return c.json({ error: "Vehicle not found" }, 404);

  const body = await c.req.parseBody();
  const file = body.file;

  if (!(file instanceof File)) {
    return c.json({ error: "Expected a 'file' field with an image" }, 400);
  }

  if (!file.type.startsWith("image/")) {
    return c.json({ error: "File must be an image" }, 400);
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return c.json({ error: "Image must be 10MB or smaller" }, 400);
  }

  const object = await c.env.MEDIA_BUCKET.put(
    `vehicles/${id}/thumbnail`,
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

vehicles.delete("/:id/thumbnail", async (c) => {
  const id = c.req.param("id");
  await c.env.MEDIA_BUCKET.delete(`vehicles/${id}/thumbnail`);
  return c.body(null, 204);
});

vehicles.get("/:id/media", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from("vehicle_media")
    .select("*")
    .eq("vehicle_id", id)
    .order("created_at", { ascending: true });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

vehicles.post("/:id/media", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);

  const { error: vehicleError } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", id)
    .single();

  if (vehicleError) return c.json({ error: "Vehicle not found" }, 404);

  const body = await c.req.parseBody({ all: true });
  const files = (Array.isArray(body.file) ? body.file : [body.file]).filter(
    (value): value is File => value instanceof File,
  );

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
            : `${file.name} must be 10MB or smaller`,
        },
        400,
      );
    }
  }

  const rows = files.map((file) => ({
    id: crypto.randomUUID(),
    vehicle_id: id,
    content_type: file.type,
    size_bytes: file.size,
  }));

  await Promise.all(
    files.map((file, i) =>
      c.env.MEDIA_BUCKET.put(`vehicles/${id}/media/${rows[i].id}`, file, {
        httpMetadata: { contentType: file.type },
      }),
    ),
  );

  const { data, error } = await supabase
    .from("vehicle_media")
    .insert(rows)
    .select();

  if (error) {
    await c.env.MEDIA_BUCKET.delete(
      rows.map((row) => `vehicles/${id}/media/${row.id}`),
    );
    return c.json({ error: error.message }, 500);
  }

  return c.json(data, 201);
});

vehicles.post("/:id/manual", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);

  const { error: vehicleError } = await supabase
    .from("vehicles")
    .select("id")
    .eq("id", id)
    .single();

  if (vehicleError) return c.json({ error: "Vehicle not found" }, 404);

  const body = await c.req.parseBody();
  const file = body.file;

  if (!(file instanceof File)) {
    return c.json({ error: "Expected a 'file' field with a PDF" }, 400);
  }

  if (file.type !== "application/pdf") {
    return c.json({ error: "File must be a PDF" }, 400);
  }

  if (file.size > MAX_MANUAL_BYTES) {
    return c.json({ error: "Manual must be 25MB or smaller" }, 400);
  }

  const { data: replaced, error: replacedError } = await supabase
    .from("vehicle_media")
    .delete()
    .eq("vehicle_id", id)
    .eq("content_type", "application/pdf")
    .select("id");

  if (replacedError) return c.json({ error: replacedError.message }, 500);

  if (replaced.length > 0) {
    await c.env.MEDIA_BUCKET.delete(
      replaced.map((row) => `vehicles/${id}/media/${row.id}`),
    );
  }

  const row = {
    id: crypto.randomUUID(),
    vehicle_id: id,
    content_type: file.type,
    size_bytes: file.size,
    caption: file.name,
  };

  await c.env.MEDIA_BUCKET.put(`vehicles/${id}/media/${row.id}`, file, {
    httpMetadata: {
      contentType: file.type,
      contentDisposition: 'inline; filename="manual.pdf"',
    },
  });

  const { data, error } = await supabase
    .from("vehicle_media")
    .insert(row)
    .select()
    .single();

  if (error) {
    await c.env.MEDIA_BUCKET.delete(`vehicles/${id}/media/${row.id}`);
    return c.json({ error: error.message }, 500);
  }

  return c.json(data, 201);
});

vehicles.delete("/:id/media/:mediaId", async (c) => {
  const id = c.req.param("id");
  const mediaId = c.req.param("mediaId");
  const supabase = getSupabase(c.env);

  const { error, count } = await supabase
    .from("vehicle_media")
    .delete({ count: "exact" })
    .eq("id", mediaId)
    .eq("vehicle_id", id);

  if (error) return c.json({ error: error.message }, 500);
  if (count === 0) return c.json({ error: "Media not found" }, 404);

  await c.env.MEDIA_BUCKET.delete(`vehicles/${id}/media/${mediaId}`);
  return c.body(null, 204);
});

vehicles.delete("/:id/parts", async (c) => {
  const vehicleId = c.req.param("id");
  const partIds = await c.req.json();

  if (!Array.isArray(partIds) || partIds.length === 0) {
    return c.json({ error: "Expected a non-empty array of part ids" }, 400);
  }

  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from("vehicle_parts")
    .delete()
    .eq("vehicle_id", vehicleId)
    .in("part_id", partIds)
    .select();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});
