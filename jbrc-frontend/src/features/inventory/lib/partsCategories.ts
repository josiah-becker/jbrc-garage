export const DefaultPartsCategory = [
  "Motor",
  "Pinion",
  "Spur",
  "Battery",
  "ESC",
  "Servo",
  "Receiver",
  "Transmitter",
  "Chassis",
  "Wheels",
  "Tires",
  "Suspension",
  "Body",
] as const;

export type PartsCategory = (typeof DefaultPartsCategory)[number];
