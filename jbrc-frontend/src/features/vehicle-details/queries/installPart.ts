import { apiFetch } from "@/lib/api";

// Installing declares the part durable; passing null uninstalls it.
export async function installPart(partId: string, vehicleId: string | null) {
  const res = await apiFetch(`/parts/${partId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(
      vehicleId
        ? { installed_vehicle_id: vehicleId, consumable: false }
        : { installed_vehicle_id: null },
    ),
  });
  if (!res.ok) throw new Error("Failed to update installed part");
  return res.json();
}
