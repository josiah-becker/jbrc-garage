import { apiFetch } from "@/lib/api";

export async function deleteVehicle(vehicleId: string) {
  const res = await apiFetch(`/vehicles/${vehicleId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete vehicle");
  return res.json();
}
