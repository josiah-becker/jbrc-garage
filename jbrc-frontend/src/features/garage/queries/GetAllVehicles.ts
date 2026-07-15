import { queryOptions } from "@tanstack/react-query";
import { VehiclesSchema, type Vehicles } from "../schemas/GetVehicles";

const api = import.meta.env.VITE_API_BASE;

export const GetAllVehiclesQuery = queryOptions<Vehicles>({
  queryKey: ["vehicles"],
  queryFn: async () => {
    const res = await fetch(`${api}/vehicles`);
    if (!res.ok) throw new Error("Failed to fetch vehicles");
    const data = await res.json();
    return VehiclesSchema.parse(data);
  },
});
