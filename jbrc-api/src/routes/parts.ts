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
  const {
    part_number,
    name,
    category,
    brand,
    notes,
    quantity,
    vehicle_ids,
    consumable,
    installed_vehicle_id,
    details,
  } = await c.req.json();

  const { data: updated, error } = await supabase
    .from("parts")
    .update({
      part_number,
      name,
      category,
      brand,
      notes,
      quantity,
      consumable,
      details,
      // consumable parts can never be installed (db check constraint)
      installed_vehicle_id: consumable === true ? null : installed_vehicle_id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    const invalid = error.code === "23514" || error.code === "23503";
    return c.json({ error: error.message }, invalid ? 400 : 500);
  }

  if (Array.isArray(vehicle_ids)) {
    const { error: unlinkError } = await supabase
      .from("vehicle_parts")
      .delete()
      .eq("part_id", id);

    if (unlinkError) return c.json({ error: unlinkError.message }, 500);

    if (vehicle_ids.length > 0) {
      const { error: linkError } = await supabase
        .from("vehicle_parts")
        .insert(
          vehicle_ids.map((vehicle_id: string) => ({
            vehicle_id,
            part_id: id,
          })),
        );

      if (linkError) return c.json({ error: linkError.message }, 500);
    }

    // removing the compatibility link for the installed vehicle also uninstalls
    if (updated.installed_vehicle_id && !vehicle_ids.includes(updated.installed_vehicle_id)) {
      const { error: uninstallError } = await supabase
        .from("parts")
        .update({ installed_vehicle_id: null })
        .eq("id", id);

      if (uninstallError) {
        return c.json({ error: uninstallError.message }, 500);
      }
    }
  }

  // an installed part is implicitly compatible with its vehicle
  if (typeof installed_vehicle_id === "string") {
    const { data: link, error: linkLookupError } = await supabase
      .from("vehicle_parts")
      .select("part_id")
      .eq("vehicle_id", installed_vehicle_id)
      .eq("part_id", id)
      .maybeSingle();

    if (linkLookupError) {
      return c.json({ error: linkLookupError.message }, 500);
    }

    if (!link) {
      const { error: linkError } = await supabase
        .from("vehicle_parts")
        .insert({ vehicle_id: installed_vehicle_id, part_id: id });

      if (linkError) return c.json({ error: linkError.message }, 500);
    }
  }

  const { data, error: fetchError } = await supabase
    .from("parts")
    .select("*, vehicle_parts(vehicles(id, name))")
    .eq("id", id)
    .single();

  if (fetchError) return c.json({ error: fetchError.message }, 500);
  return c.json(withCompatibleVehicles(data));
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
