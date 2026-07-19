import { queryOptions } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { PartsSchema, type Parts } from "../schemas/GetAllParts";

export const GetAllPartsQuery = queryOptions<Parts>({
  queryKey: ["parts"],
  queryFn: async () => {
    const res = await apiFetch("/parts");
    if (!res.ok) throw new Error("Failed to fetch parts");
    const data = await res.json();
    return PartsSchema.parse(data);
  },
});
