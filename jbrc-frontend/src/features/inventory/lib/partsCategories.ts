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
  "Differentials",
  "Shocks",
  "Body",
  "Differential Oil",
  "Shock Oil",
] as const;

export type PartsCategory = (typeof DefaultPartsCategory)[number];
