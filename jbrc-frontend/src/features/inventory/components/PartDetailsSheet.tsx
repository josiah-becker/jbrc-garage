import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { GetAllPartsQuery } from "../queries/allPartsQuery";
import { updatePart } from "../queries/updatePart";
import type { Part, PartQuantity } from "../schemas/GetAllParts";

const emptyQuantity: PartQuantity = { total: 0, new: 0, used: 0 };

// Keyed by part.id from the parent so this remounts (and re-seeds its form
// state from props) whenever a different part is selected.
function PartEditForm({
  part,
  onSaved,
}: {
  part: Part;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    part_number: part.part_number,
    name: part.name,
    category: part.category,
    notes: part.notes ?? "",
  });
  const [quantity, setQuantity] = useState<PartQuantity>(
    part.quantity ?? emptyQuantity,
  );

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      updatePart(part.id, {
        part_number: form.part_number,
        name: form.name,
        category: form.category,
        notes: form.notes || null,
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GetAllPartsQuery.queryKey });
      onSaved();
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>Edit Part</SheetTitle>
        <SheetDescription>
          View and update this part's details.
        </SheetDescription>
      </SheetHeader>
      <form
        id="edit-part-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 px-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-part-number">Part number</Label>
          <Input
            id="edit-part-number"
            required
            value={form.part_number}
            onChange={(e) =>
              setForm({ ...form, part_number: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-name">Name</Label>
          <Input
            id="edit-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-category">Category</Label>
          <Input
            id="edit-category"
            required
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Brand</Label>
          <p className="text-sm text-muted-foreground">
            {part.brand ?? "N/A"}
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-notes">Notes</Label>
          <Textarea
            id="edit-notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Quantity</Label>
          <div className="grid grid-cols-3 gap-2">
            <div className="flex flex-col gap-1">
              <Label
                htmlFor="edit-qty-total"
                className="text-xs font-normal text-muted-foreground"
              >
                Total
              </Label>
              <Input
                id="edit-qty-total"
                type="number"
                min={0}
                value={quantity.total}
                onChange={(e) =>
                  setQuantity({ ...quantity, total: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label
                htmlFor="edit-qty-new"
                className="text-xs font-normal text-muted-foreground"
              >
                New
              </Label>
              <Input
                id="edit-qty-new"
                type="number"
                min={0}
                value={quantity.new}
                onChange={(e) =>
                  setQuantity({ ...quantity, new: Number(e.target.value) })
                }
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label
                htmlFor="edit-qty-used"
                className="text-xs font-normal text-muted-foreground"
              >
                Used
              </Label>
              <Input
                id="edit-qty-used"
                type="number"
                min={0}
                value={quantity.used}
                onChange={(e) =>
                  setQuantity({ ...quantity, used: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Compatible vehicles</Label>
          {part.vehicles.length === 0 ? (
            <p className="text-sm text-muted-foreground">N/A</p>
          ) : (
            <div className="flex flex-wrap gap-1">
              {part.vehicles.map((vehicle) => (
                <Badge key={vehicle.id} variant="secondary">
                  {vehicle.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
        {mutation.isError && (
          <p className="text-sm text-destructive">
            Failed to save changes. Please try again.
          </p>
        )}
      </form>
      <SheetFooter>
        <SheetClose render={<Button variant="outline" />}>Cancel</SheetClose>
        <Button
          type="submit"
          form="edit-part-form"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save changes"}
        </Button>
      </SheetFooter>
    </>
  );
}

export default function PartDetailsSheet({
  part,
  onOpenChange,
}: {
  part: Part | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={!!part} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md overflow-y-auto">
        {part && (
          <PartEditForm
            key={part.id}
            part={part}
            onSaved={() => onOpenChange(false)}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
