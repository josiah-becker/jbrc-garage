import { Hono } from "hono";
import { getSupabase, type SupabaseBindings } from "../lib/supabase";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

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
