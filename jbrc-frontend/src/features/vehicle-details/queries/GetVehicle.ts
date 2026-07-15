import { queryOptions } from "@tanstack/react-query";
import { VehicleSchema, type Vehicle } from "../../garage/schemas/GetVehicles";

const api = import.meta.env.VITE_API_BASE;

export const GetVehicleQuery = (id: string) =>
  queryOptions<Vehicle>({
    queryKey: ["vehicles", id],
    queryFn: async () => {
      const res = await fetch(`${api}/vehicles/${id}`);
      if (!res.ok) throw new Error("Failed to fetch vehicle");
      const data = await res.json();
      return VehicleSchema.parse(data);
    },
  });
