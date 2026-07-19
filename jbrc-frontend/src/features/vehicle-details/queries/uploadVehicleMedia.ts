import { apiFetch } from "@/lib/api";

export async function uploadVehicleMedia(vehicleId: string, files: File[]) {
  const formData = new FormData();
  for (const file of files) formData.append("file", file);

  const res = await apiFetch(`/vehicles/${vehicleId}/media`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload media");
  return res.json();
}

export async function deleteVehicleMedia(vehicleId: string, mediaId: string) {
  const res = await apiFetch(`/vehicles/${vehicleId}/media/${mediaId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove media");
}
