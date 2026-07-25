import { apiFetch } from "@/lib/api";
import { SessionRowSchema, type SessionRow } from "../schemas/GetSessions";

export type NewSession = {
  name: string;
  session_date: string;
  location?: string | null;
  notes?: string | null;
  vehicle_ids: string[];
};

export async function createSession(session: NewSession): Promise<SessionRow> {
  const res = await apiFetch("/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });
  if (!res.ok) throw new Error("Failed to create session");
  return SessionRowSchema.parse(await res.json());
}
