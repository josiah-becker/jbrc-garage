const api = import.meta.env.VITE_API_BASE;

export type NewPart = {
  part_number: string;
  name: string;
  category: string;
  brand?: string | null;
  notes?: string | null;
  vehicle_ids?: string[];
};

export async function createParts(parts: NewPart[]) {
  const res = await fetch(`${api}/parts/batch`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(parts),
  });
  if (!res.ok) throw new Error("Failed to create parts");
  return res.json();
}
