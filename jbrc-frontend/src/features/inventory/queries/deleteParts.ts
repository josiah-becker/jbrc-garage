import { apiFetch } from "@/lib/api";

export async function deleteParts(ids: string[]) {
  const res = await apiFetch("/parts/batch", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error("Failed to delete parts");
  return res.json();
}

export async function unlinkVehicleParts(vehicleId: string, partIds: string[]) {
  const res = await apiFetch(`/vehicles/${vehicleId}/parts`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(partIds),
  });
  if (!res.ok) throw new Error("Failed to remove parts from vehicle");
  return res.json();
}
