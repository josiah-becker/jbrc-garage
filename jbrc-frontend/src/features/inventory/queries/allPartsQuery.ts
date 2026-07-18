import { queryOptions } from "@tanstack/react-query";
import { PartsSchema, type Parts } from "../schemas/GetAllParts";

const api = import.meta.env.VITE_API_BASE;

export const GetAllPartsQuery = queryOptions<Parts>({
  queryKey: ["parts"],
  queryFn: async () => {
    const res = await fetch(`${api}/parts`);
    if (!res.ok) throw new Error("Failed to fetch parts");
    const data = await res.json();
    return PartsSchema.parse(data);
  },
});
