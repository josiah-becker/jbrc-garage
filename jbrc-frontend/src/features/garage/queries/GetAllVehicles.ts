import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { VehiclesSchema, type Vehicles } from "../schemas/GetVehicles";

export const GetAllVehiclesQuery = queryOptions<Vehicles>({
  queryKey: ["vehicles"],
  queryFn: async () => {
    const res = await apiFetch("/vehicles");
    if (!res.ok) throw new Error("Failed to fetch vehicles");
    const data = await res.json();
    return VehiclesSchema.parse(data);
  },
});
