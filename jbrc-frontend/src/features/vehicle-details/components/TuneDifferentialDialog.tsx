import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { DiffDetails } from "@/features/inventory/lib/partsDetails";
import { GetAllPartsQuery } from "@/features/inventory/queries/allPartsQuery";
import type { Part } from "@/features/inventory/schemas/GetAllParts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WrenchIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import {
  emptyOilForm,
  OIL_CATEGORY,
  resolveOilPartId,
  type OilForm,
} from "@/features/inventory/lib/differentials";
import { updatePartDetails } from "../queries/updatePartDetails";
import DifferentialDetailsFields from "@/features/inventory/components/DifferentialDetailsFields";

function toSealed(details: Part["details"]): boolean {
  return typeof details?.sealed === "boolean" ? details.sealed : false;
}

function toOilPartId(details: Part["details"]): string | null {
  return typeof details?.oil_part_id === "string" ? details.oil_part_id : null;
}

// Edits the details jsonb blob for an installed differential: whether it's
// sealed, and which oil from inventory is in it (or add a new oil part).
export default function TuneDifferentialDialog({
  part,
  parts,
}: {
  part: Part;
  parts: Part[];
}) {
  const oilOptions = parts.filter((p) => p.category === OIL_CATEGORY);
  const defaultOilMode = oilOptions.length > 0 ? "existing" : "new";

  const [open, setOpen] = useState(false);
  const [sealed, setSealed] = useState(() => toSealed(part.details));
  const [oilMode, setOilMode] = useState<"existing" | "new">(defaultOilMode);
  const [selectedOilId, setSelectedOilId] = useState<string | null>(() =>
    toOilPartId(part.details),
  );
  const [oilForm, setOilForm] = useState<OilForm>(emptyOilForm);

  const queryClient = useQueryClient();

  function resetForm() {
    setSealed(toSealed(part.details));
    setSelectedOilId(toOilPartId(part.details));
    setOilMode(defaultOilMode);
    setOilForm(emptyOilForm);
  }

  const mutation = useMutation({
    mutationFn: async () => {
      const oilPartId = await resolveOilPartId(oilMode, selectedOilId, oilForm);
      const details: DiffDetails = { sealed, oil_part_id: oilPartId };
      return updatePartDetails(part.id, details);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GetAllPartsQuery.queryKey });
      setOpen(false);
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) resetForm();
        else mutation.reset();
      }}
    >
      <DialogTrigger
        render={
          <Button variant="ghost" size="sm" aria-label={`Tune ${part.name}`}>
            <WrenchIcon />
            Tune
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tune {part.name}</DialogTitle>
          <DialogDescription>
            Choose the oil in this differential, or add a new one to your
            inventory.
          </DialogDescription>
        </DialogHeader>
        <form
          id={`tune-diff-form-${part.id}`}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <DifferentialDetailsFields
            idPrefix={`tune-diff-${part.id}`}
            parts={parts}
            sealed={sealed}
            onSealedChange={setSealed}
            oilMode={oilMode}
            onOilModeChange={setOilMode}
            selectedOilId={selectedOilId}
            onSelectedOilIdChange={setSelectedOilId}
            oilForm={oilForm}
            onOilFormChange={setOilForm}
          />
          {mutation.isError && (
            <p className="text-sm text-destructive">
              Failed to save. Please try again.
            </p>
          )}
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form={`tune-diff-form-${part.id}`}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
