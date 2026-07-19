import { apiFetch } from "@/lib/api";

export async function uploadVehiclePhoto(vehicleId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch(`/vehicles/${vehicleId}/thumbnail`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload thumbnail");
  return res.json();
}

export async function deleteVehiclePhoto(vehicleId: string) {
  const res = await apiFetch(`/vehicles/${vehicleId}/thumbnail`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove thumbnail");
}
