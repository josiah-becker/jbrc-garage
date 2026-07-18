const api = import.meta.env.VITE_API_BASE;

export async function deleteParts(ids: string[]) {
  const res = await fetch(`${api}/parts/batch`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error("Failed to delete parts");
  return res.json();
}
