import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { SessionsListSchema, type SessionsList } from "../schemas/GetSessions";

export const GetSessionsForVehicleQuery = (vehicleId: string) =>
  queryOptions<SessionsList>({
    queryKey: ["sessions", "vehicle", vehicleId],
    queryFn: async () => {
      const res = await apiFetch(`/sessions?vehicle_id=${vehicleId}`);
      if (!res.ok) throw new Error("Failed to fetch sessions");
      const data = await res.json();
      return SessionsListSchema.parse(data);
    },
  });
