const mediaBase = import.meta.env.VITE_MEDIA_BASE;

export function getVehicleThumbnailUrl(vehicleId: string) {
  return `${mediaBase}/vehicles/${vehicleId}/thumbnail`;
}

export function getVehicleMediaUrl(vehicleId: string, mediaId: string) {
  return `${mediaBase}/vehicles/${vehicleId}/media/${mediaId}`;
}
