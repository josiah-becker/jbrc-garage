export type DiffDetails = {
  sealed: boolean;
  oil_part_id: string | null;
};

export type SuspensionDetails = {
  shock_type: "emulsion" | "bladder";
  spring: string;
  fluid: string;
};
