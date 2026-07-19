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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PencilIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import { GetAllVehiclesQuery } from "../queries/GetAllVehicles";
import { updateVehicle } from "../queries/updateVehicle";
import type { Vehicle } from "../schemas/GetVehicles";

// Rendered inside DialogContent so it remounts (and re-seeds its form state
// from props) each time the dialog opens.
function EditVehicleForm({
  vehicle,
  onSaved,
}: {
  vehicle: Vehicle;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: vehicle.name,
    brand: vehicle.brand,
    scale: vehicle.scale,
    // timestamptz in the db; the date input needs just the YYYY-MM-DD part
    purchase_date: vehicle.purchase_date?.slice(0, 10) ?? "",
    notes: vehicle.notes ?? "",
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      updateVehicle(vehicle.id, {
        name: form.name,
        brand: form.brand,
        scale: form.scale,
        purchase_date: form.purchase_date || null,
        notes: form.notes || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GetAllVehiclesQuery.queryKey });
      onSaved();
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    mutation.mutate();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit vehicle</DialogTitle>
        <DialogDescription>
          Update the details for {vehicle.name}.
        </DialogDescription>
      </DialogHeader>
      <form
        id="edit-vehicle-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-vehicle-name">Name</Label>
          <Input
            id="edit-vehicle-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-vehicle-brand">Brand</Label>
          <Input
            id="edit-vehicle-brand"
            required
            value={form.brand}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-vehicle-scale">Scale</Label>
          <Input
            id="edit-vehicle-scale"
            required
            placeholder="e.g. 1:10"
            value={form.scale}
            onChange={(e) => setForm({ ...form, scale: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-vehicle-purchase-date">Purchase date</Label>
          <Input
            id="edit-vehicle-purchase-date"
            type="date"
            value={form.purchase_date}
            onChange={(e) =>
              setForm({ ...form, purchase_date: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-vehicle-notes">Notes</Label>
          <Textarea
            id="edit-vehicle-notes"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
        {mutation.isError && (
          <p className="text-sm text-destructive">
            Failed to save changes. Please try again.
          </p>
        )}
      </form>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <Button
          type="submit"
          form="edit-vehicle-form"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </>
  );
}

export default function EditVehicleDialog({ vehicle }: { vehicle: Vehicle }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <PencilIcon /> Edit Vehicle
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <EditVehicleForm vehicle={vehicle} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
