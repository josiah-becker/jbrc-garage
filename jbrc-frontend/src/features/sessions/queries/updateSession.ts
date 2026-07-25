import { apiFetch } from "@/lib/api";
import { SessionRowSchema, type SessionRow } from "../schemas/GetSessions";

export type SessionEdits = {
  name: string;
  session_date: string;
  location: string | null;
  notes: string | null;
  vehicle_ids: string[];
};

export async function updateSession(
  id: string,
  edits: SessionEdits,
): Promise<SessionRow> {
  const res = await apiFetch(`/sessions/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(edits),
  });
  if (!res.ok) throw new Error("Failed to update session");
  return SessionRowSchema.parse(await res.json());
}
