import { z } from "zod";

export const VehicleMediaSchema = z.object({
  id: z.string(),
  vehicle_id: z.string(),
  content_type: z.string(),
  size_bytes: z.number(),
  caption: z.string().nullable(),
  created_at: z.string(),
});

export type VehicleMedia = z.infer<typeof VehicleMediaSchema>;

export const VehicleMediaListSchema = z.array(VehicleMediaSchema);

export type VehicleMediaList = z.infer<typeof VehicleMediaListSchema>;
