import { apiFetch } from "@/lib/api";
import type { MediaUploadItem } from "@/components/media/types";

export async function uploadSessionMedia(
  sessionId: string,
  items: MediaUploadItem[],
) {
  const formData = new FormData();
  for (const { file, caption } of items) {
    formData.append("file", file);
    formData.append("caption", caption ?? "");
  }

  const res = await apiFetch(`/sessions/${sessionId}/media`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload media" + (await res.text()));
  return res.json();
}

export async function deleteSessionMedia(sessionId: string, mediaId: string) {
  const res = await apiFetch(`/sessions/${sessionId}/media/${mediaId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove media");
}
