import { apiFetch } from "@/lib/api";

export async function deleteSession(sessionId: string) {
  const res = await apiFetch(`/sessions/${sessionId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete session");
  return res.json();
}
