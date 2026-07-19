import { apiFetch } from "@/lib/api";
import type { PartQuantity } from "../schemas/GetAllParts";

export type PartEdits = {
  part_number: string;
  name: string;
  category: string;
  notes: string | null;
  quantity: PartQuantity;
  vehicle_ids: string[];
};

export async function updatePart(id: string, edits: PartEdits) {
  const res = await apiFetch(`/parts/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(edits),
  });
  if (!res.ok) throw new Error("Failed to update part");
  return res.json();
}
