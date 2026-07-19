import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { VehicleSchema, type Vehicle } from "../../garage/schemas/GetVehicles";

export const GetVehicleQuery = (id: string) =>
  queryOptions<Vehicle>({
    queryKey: ["vehicles", id],
    queryFn: async () => {
      const res = await apiFetch(`/vehicles/${id}`);
      if (!res.ok) throw new Error("Failed to fetch vehicle");
      const data = await res.json();
      return VehicleSchema.parse(data);
    },
  });
