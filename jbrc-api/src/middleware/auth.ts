import type { MiddlewareHandler } from "hono";
import { getSupabase, type SupabaseBindings } from "../lib/supabase";

export const requireAuth: MiddlewareHandler<{
  Bindings: SupabaseBindings;
}> = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  if (!token) return c.json({ error: "Unauthorized" }, 401);

  const supabase = getSupabase(c.env);
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) return c.json({ error: "Unauthorized" }, 401);

  await next();
};
