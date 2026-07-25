import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { SessionsListSchema, type SessionsList } from "../schemas/GetSessions";

export const GetAllSessionsQuery = queryOptions<SessionsList>({
  queryKey: ["sessions"],
  queryFn: async () => {
    const res = await apiFetch("/sessions");
    if (!res.ok) throw new Error("Failed to fetch sessions");
    const data = await res.json();
    return SessionsListSchema.parse(data);
  },
});
