import { apiFetch } from "@/lib/api";

export async function updatePartDetails(
  partId: string,
  details: Record<string, unknown>,
) {
  const res = await apiFetch(`/parts/${partId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ details }),
  });
  if (!res.ok) throw new Error("Failed to update part details");
  return res.json();
}
