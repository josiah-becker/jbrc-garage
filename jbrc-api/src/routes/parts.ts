import { Hono } from "hono";
import { getSupabase, type SupabaseBindings } from "../lib/supabase";

function withCompatibleVehicles(part: {
  vehicle_parts: { vehicles: unknown }[];
  [key: string]: unknown;
}) {
  const { vehicle_parts, ...rest } = part;
  return { ...rest, vehicles: vehicle_parts.map((vp) => vp.vehicles) };
}

type NewPartInput = Record<string, unknown> & { vehicle_ids?: string[] };

async function insertParts(
  supabase: ReturnType<typeof getSupabase>,
  parts: NewPartInput[],
) {
  const partsToInsert = parts.map(({ vehicle_ids, ...part }) => part);

  const { data, error } = await supabase
    .from("parts")
    .insert(partsToInsert)
    .select();

  if (error) return { data: null, error };

  const links = parts.flatMap(({ vehicle_ids }, index) =>
    Array.isArray(vehicle_ids)
      ? vehicle_ids.map((vehicle_id) => ({
          vehicle_id,
          part_id: data[index].id,
        }))
      : [],
  );

  if (links.length > 0) {
    const { error: linkError } = await supabase
      .from("vehicle_parts")
      .insert(links);

    if (linkError) return { data: null, error: linkError };
  }

  return { data, error: null };
}

async function deleteParts(
  supabase: ReturnType<typeof getSupabase>,
  ids: string[],
) {
  const { error: linkError } = await supabase
    .from("vehicle_parts")
    .delete()
    .in("part_id", ids);

  if (linkError) return { data: null, error: linkError };

  const { data, error } = await supabase
    .from("parts")
    .delete()
    .in("id", ids)
    .select();

  if (error) return { data: null, error };

  return { data, error: null };
}

export const parts = new Hono<{ Bindings: SupabaseBindings }>();

parts.get("/", async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from("parts")
    .select("*, vehicle_parts(vehicles(id, name))");
  if (error) return c.json({ error: error.message }, 500);

  return c.json(data.map(withCompatibleVehicles));
});

parts.get("/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from("parts")
    .select("*, vehicle_parts(vehicles(id, name))")
    .eq("id", id)
    .single();

  if (error) return c.json({ error: error.message }, 404);
  return c.json(withCompatibleVehicles(data));
});

parts.post("/", async (c) => {
  const supabase = getSupabase(c.env);
  const part: NewPartInput = await c.req.json();

  const { data, error } = await insertParts(supabase, [part]);

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data[0], 201);
});

parts.post("/batch", async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();

  if (!Array.isArray(body) || body.length === 0) {
    return c.json({ error: "Expected a non-empty array of parts" }, 400);
  }

  const { data, error } = await insertParts(supabase, body);

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

parts.post("/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);
  const { part_number, name, category, notes, quantity } = await c.req.json();

  const { data, error } = await supabase
    .from("parts")
    .update({ part_number, name, category, notes, quantity })
    .eq("id", id)
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

parts.delete("/batch", async (c) => {
  const supabase = getSupabase(c.env);
  const ids = await c.req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return c.json({ error: "Expected a non-empty array of part ids" }, 400);
  }

  const { data, error } = await deleteParts(supabase, ids);

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

parts.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);

  const { data, error } = await deleteParts(supabase, [id]);

  if (error) return c.json({ error: error.message }, 500);
  if (data.length === 0) return c.json({ error: "Part not found" }, 404);

  return c.json(data[0]);
});
