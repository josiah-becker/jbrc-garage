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
