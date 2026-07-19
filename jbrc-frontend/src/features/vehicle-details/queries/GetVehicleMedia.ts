import { apiFetch } from "@/lib/api";
import { queryOptions } from "@tanstack/react-query";
import {
  VehicleMediaListSchema,
  type VehicleMediaList,
} from "../schemas/GetVehicleMedia";

export const GetVehicleMediaQuery = (vehicleId: string) =>
  queryOptions<VehicleMediaList>({
    queryKey: ["vehicles", vehicleId, "media"],
    queryFn: async () => {
      const res = await apiFetch(`/vehicles/${vehicleId}/media`);
      if (!res.ok) throw new Error("Failed to fetch media");
      const data = await res.json();
      return VehicleMediaListSchema.parse(data);
    },
  });
