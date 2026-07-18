import type { PartQuantity } from "../schemas/GetAllParts";

const api = import.meta.env.VITE_API_BASE;

export type PartEdits = {
  part_number: string;
  name: string;
  category: string;
  notes: string | null;
  quantity: PartQuantity;
};

export async function updatePart(id: string, edits: PartEdits) {
  const res = await fetch(`${api}/parts/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(edits),
  });
  if (!res.ok) throw new Error("Failed to update part");
  return res.json();
}
