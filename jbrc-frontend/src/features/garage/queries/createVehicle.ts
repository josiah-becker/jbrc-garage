import { apiFetch } from "@/lib/api";
import { VehicleSchema, type Vehicle } from "../schemas/GetVehicles";

export type NewVehicle = {
  name: string;
  brand: string;
  scale: string;
  notes?: string | null;
  purchase_date?: string | null;
};

export async function createVehicle(vehicle: NewVehicle): Promise<Vehicle> {
  const res = await apiFetch("/vehicles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(vehicle),
  });
  if (!res.ok) throw new Error("Failed to create vehicle");
  return VehicleSchema.parse(await res.json());
}
