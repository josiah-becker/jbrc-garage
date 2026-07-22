import { createParts } from "@/features/inventory/queries/createPart";

export const DIFFERENTIAL_CATEGORY = "Differentials";
export const OIL_CATEGORY = "Differential Oil";
export const NONE_OIL_VALUE = "__none__";

export type OilForm = {
  part_number: string;
  name: string;
  brand: string;
  notes: string;
};

export const emptyOilForm: OilForm = {
  part_number: "",
  name: "",
  brand: "",
  notes: "",
};

// Resolves oil-picker state to a part id, creating a new Differential Oil
// inventory part first if the user chose "Create new" instead of an
// existing one.
export async function resolveOilPartId(
  oilMode: "existing" | "new",
  selectedOilId: string | null,
  oilForm: OilForm,
): Promise<string | null> {
  if (oilMode === "existing") return selectedOilId;

  const [created] = (await createParts([
    {
      part_number: oilForm.part_number,
      name: oilForm.name,
      category: OIL_CATEGORY,
      brand: oilForm.brand || null,
      notes: oilForm.notes || null,
      consumable: true,
    },
  ])) as { id: string }[];
  return created.id;
}
