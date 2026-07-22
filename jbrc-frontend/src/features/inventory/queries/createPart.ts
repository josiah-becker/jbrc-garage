import { apiFetch } from "@/lib/api";

export type NewPart = {
  part_number: string;
  name: string;
  category: string;
  brand?: string | null;
  notes?: string | null;
  vehicle_ids?: string[];
  consumable?: boolean;
  installed_vehicle_id?: string | null;
  details?: Record<string, unknown> | null;
};

export async function createParts(parts: NewPart[]) {
  const res = await apiFetch("/parts/batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parts),
  });
  if (!res.ok) throw new Error("Failed to create parts");
  return res.json();
}
