import { z } from "zod";

export const VehicleSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  scale: z.string(),
  notes: z.string().nullable(),
});

export type Vehicle = z.infer<typeof VehicleSchema>;

export const VehiclesSchema = z.array(VehicleSchema);

export type Vehicles = z.infer<typeof VehiclesSchema>;
