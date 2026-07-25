import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { SessionSchema, type Session } from "../schemas/GetSessions";

export const GetSessionQuery = (id: string) =>
  queryOptions<Session>({
    queryKey: ["sessions", id],
    queryFn: async () => {
      const res = await apiFetch(`/sessions/${id}`);
      if (!res.ok) throw new Error("Failed to fetch session");
      const data = await res.json();
      return SessionSchema.parse(data);
    },
  });
