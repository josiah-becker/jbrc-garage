import { apiFetch } from "@/lib/api";
import { queryOptions } from "@tanstack/react-query";
import {
  SessionMediaListSchema,
  type SessionMediaList,
} from "../schemas/GetSessionMedia";

export const GetSessionMediaQuery = (sessionId: string) =>
  queryOptions<SessionMediaList>({
    queryKey: ["sessions", sessionId, "media"],
    queryFn: async () => {
      const res = await apiFetch(`/sessions/${sessionId}/media`);
      if (!res.ok) throw new Error("Failed to fetch media");
      const data = await res.json();
      return SessionMediaListSchema.parse(data);
    },
  });
