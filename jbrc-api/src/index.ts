import { Hono } from "hono";
import { cors } from "hono/cors";
import { getSupabase, type SupabaseBindings } from "./lib/supabase";

const app = new Hono<{ Bindings: SupabaseBindings }>();

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
  }),
);

// Vehicles

app.get("/vehicles", async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase.from("vehicles").select("*");

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.get("/vehicles/:id", async (c) => {
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

export default app;

// Parts

function withCompatibleVehicles(part: {
  vehicle_parts: { vehicles: unknown }[];
  [key: string]: unknown;
}) {
  const { vehicle_parts, ...rest } = part;
  return { ...rest, vehicles: vehicle_parts.map((vp) => vp.vehicles) };
}

app.get("/parts", async (c) => {
  const supabase = getSupabase(c.env);
  const { data, error } = await supabase
    .from("parts")
    .select("*, vehicle_parts(vehicles(id, name))");
  if (error) return c.json({ error: error.message }, 500);

  return c.json(data.map(withCompatibleVehicles));
});

app.get("/parts/:id", async (c) => {
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

app.post("/parts", async (c) => {
  const supabase = getSupabase(c.env);
  const part: NewPartInput = await c.req.json();

  const { data, error } = await insertParts(supabase, [part]);

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data[0], 201);
});

app.post("/parts/batch", async (c) => {
  const supabase = getSupabase(c.env);
  const body = await c.req.json();

  if (!Array.isArray(body) || body.length === 0) {
    return c.json({ error: "Expected a non-empty array of parts" }, 400);
  }

  const { data, error } = await insertParts(supabase, body);

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data, 201);
});

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

app.delete("/parts/batch", async (c) => {
  const supabase = getSupabase(c.env);
  const ids = await c.req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return c.json({ error: "Expected a non-empty array of part ids" }, 400);
  }

  const { data, error } = await deleteParts(supabase, ids);

  if (error) return c.json({ error: error.message }, 500);
  return c.json(data);
});

app.delete("/parts/:id", async (c) => {
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);

  const { data, error } = await deleteParts(supabase, [id]);

  if (error) return c.json({ error: error.message }, 500);
  if (data.length === 0) return c.json({ error: "Part not found" }, 404);

  return c.json(data[0]);
});

// Vehicle parts

app.delete("/vehicles/:id/parts", async (c) => {
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
