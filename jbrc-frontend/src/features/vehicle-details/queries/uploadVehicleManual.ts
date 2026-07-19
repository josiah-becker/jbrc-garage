import { apiFetch } from "@/lib/api";

export async function uploadVehicleManual(vehicleId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch(`/vehicles/${vehicleId}/manual`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload manual");
  return res.json();
}
