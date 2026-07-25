import { apiFetch } from "@/lib/api";

export type MediaUploadItem = {
  file: File;
  caption?: string;
};

export async function uploadVehicleMedia(
  vehicleId: string,
  items: MediaUploadItem[],
) {
  const formData = new FormData();
  for (const { file, caption } of items) {
    formData.append("file", file);
    formData.append("caption", caption ?? "");
  }

  const res = await apiFetch(`/vehicles/${vehicleId}/media`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload media" + (await res.text()));
  return res.json();
}

export async function deleteVehicleMedia(vehicleId: string, mediaId: string) {
  const res = await apiFetch(`/vehicles/${vehicleId}/media/${mediaId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove media");
}
