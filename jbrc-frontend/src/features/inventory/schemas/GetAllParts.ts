import { z } from "zod";

export const PartQuantitySchema = z.object({
  total: z.number(),
  new: z.number(),
  used: z.number(),
});

export type PartQuantity = z.infer<typeof PartQuantitySchema>;

export const PartSchema = z.object({
  id: z.string(),
  part_number: z.string(),
  name: z.string(),
  category: z.string(),
  brand: z.string().nullable(),
  notes: z.string().nullable(),
  vehicles: z.array(z.object({ id: z.string(), name: z.string() })),
  quantity: PartQuantitySchema.nullable(),
  consumable: z.boolean(),
  installed_vehicle_id: z.string().nullable(),
});

export type Part = z.infer<typeof PartSchema>;

export const PartsSchema = z.array(PartSchema);

export type Parts = z.infer<typeof PartsSchema>;
