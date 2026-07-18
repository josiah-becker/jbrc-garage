import z from "zod";

export const PartSchema = z.object({
  id: z.uuid(),
  part_number: z.string(),
  name: z.string(),
  category: z.string(),
  brand: z.string().optional(),
  notes: z.string().optional(),
});

export type Part = z.infer<typeof PartSchema>;
