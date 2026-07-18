import { z } from "zod";

export const PartSchema = z.object({
  id: z.string(),
  part_number: z.string(),
  name: z.string(),
  category: z.string(),
  brand: z.string().nullable(),
  notes: z.string().nullable(),
});

export type Part = z.infer<typeof PartSchema>;

export const PartsSchema = z.array(PartSchema);

export type Parts = z.infer<typeof PartsSchema>;
