import { Hono } from "hono";
import { cors } from "hono/cors";
import type { SupabaseBindings } from "./lib/supabase";
import { requireAuth } from "./middleware/auth";
import { vehicles } from "./routes/vehicles";
import { parts } from "./routes/parts";

const app = new Hono<{ Bindings: SupabaseBindings }>();

app.use("*", (c, next) =>
  cors({
    origin: c.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim()),
    allowHeaders: ["Content-Type", "Authorization"],
  })(c, next),
);

app.use("*", requireAuth);

app.route("/vehicles", vehicles);
app.route("/parts", parts);

export default app;
