const mediaBase = import.meta.env.VITE_MEDIA_BASE;

export function getVehicleThumbnailUrl(vehicleId: string) {
  return `${mediaBase}/vehicles/${vehicleId}/thumbnail`;
}
