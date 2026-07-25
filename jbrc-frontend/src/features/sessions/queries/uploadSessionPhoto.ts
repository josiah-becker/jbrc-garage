import { apiFetch } from "@/lib/api";

export async function uploadSessionPhoto(sessionId: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await apiFetch(`/sessions/${sessionId}/thumbnail`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload thumbnail");
  return res.json();
}

export async function deleteSessionPhoto(sessionId: string) {
  const res = await apiFetch(`/sessions/${sessionId}/thumbnail`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove thumbnail");
}
