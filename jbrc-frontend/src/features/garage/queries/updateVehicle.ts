import { apiFetch } from "@/lib/api";
import { VehicleSchema, type Vehicle } from "../schemas/GetVehicles";

export type VehicleEdits = {
  name: string;
  brand: string;
  scale: string;
  notes: string | null;
  purchase_date: string | null;
};

export async function updateVehicle(
  id: string,
  edits: VehicleEdits,
): Promise<Vehicle> {
  const res = await apiFetch(`/vehicles/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(edits),
  });
  if (!res.ok) throw new Error("Failed to update vehicle");
  return VehicleSchema.parse(await res.json());
}
