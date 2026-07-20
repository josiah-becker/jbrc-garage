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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { GetAllPartsQuery } from "@/features/inventory/queries/allPartsQuery";
import { createParts } from "@/features/inventory/queries/createPart";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { type FormEvent, useState } from "react";

const emptyForm = {
  part_number: "",
  name: "",
  brand: "",
  notes: "",
};

// Creates a part in the given category and installs it on the vehicle in
// one step.
export default function AddRigPartDialog({
  category,
  vehicleId,
}: {
  category: string;
  vehicleId: string;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const idPrefix = category.toLowerCase().replace(/\s+/g, "-");

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      createParts([
        {
          part_number: form.part_number,
          name: form.name,
          category,
          brand: form.brand || null,
          notes: form.notes || null,
          vehicle_ids: [vehicleId],
          consumable: false,
          installed_vehicle_id: vehicleId,
        },
      ]),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GetAllPartsQuery.queryKey });
      setOpen(false);
      resetForm();
    },
  });

  function resetForm() {
    setForm(emptyForm);
    mutation.reset();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogTrigger
        render={
          <Button variant="secondary" size="icon-sm">
            <PlusIcon />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add {category} part</DialogTitle>
          <DialogDescription>
            The new part is added to your inventory and installed on this
            vehicle.
          </DialogDescription>
        </DialogHeader>
        <form
          id={`add-${idPrefix}-part-form`}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-part-number`}>Part number</Label>
            <Input
              id={`${idPrefix}-part-number`}
              required
              value={form.part_number}
              onChange={(e) =>
                setForm({ ...form, part_number: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-part-name`}>Name</Label>
            <Input
              id={`${idPrefix}-part-name`}
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-part-brand`}>Brand</Label>
            <Input
              id={`${idPrefix}-part-brand`}
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-part-notes`}>Notes</Label>
            <Textarea
              id={`${idPrefix}-part-notes`}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          {mutation.isError && (
            <p className="text-sm text-destructive">
              Failed to add part. Please try again.
            </p>
          )}
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form={`add-${idPrefix}-part-form`}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Adding..." : "Add part"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
