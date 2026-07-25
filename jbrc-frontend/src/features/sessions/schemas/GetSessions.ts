import { z } from "zod";

export const SessionVehicleSchema = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  scale: z.string(),
});

export type SessionVehicle = z.infer<typeof SessionVehicleSchema>;

// Shape returned by the create/update endpoints, which don't re-embed vehicles.
export const SessionRowSchema = z.object({
  id: z.string(),
  name: z.string(),
  session_date: z.string(),
  location: z.string().nullable(),
  notes: z.string().nullable(),
  created_at: z.string(),
});

export type SessionRow = z.infer<typeof SessionRowSchema>;

export const SessionSchema = SessionRowSchema.extend({
  vehicles: z.array(SessionVehicleSchema),
});

export type Session = z.infer<typeof SessionSchema>;

export const SessionsListSchema = z.array(SessionSchema);

export type SessionsList = z.infer<typeof SessionsListSchema>;
