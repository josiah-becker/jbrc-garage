import H3 from "@/components/H3";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Vehicles } from "@/features/garage/schemas/GetVehicles";
import { GetAllPartsQuery } from "@/features/inventory/queries/allPartsQuery";
import { createParts } from "@/features/inventory/queries/createPart";
import type { Part } from "@/features/inventory/schemas/GetAllParts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, XIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import { installPart } from "../queries/installPart";

const emptyForm = {
  part_number: "",
  name: "",
  brand: "",
  notes: "",
};

// Creates a part in the slot's category and installs it on the vehicle in
// one step.
function AddRigPartDialog({
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
          <Button>
            <PlusIcon /> Add new
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

export default function RigSlotCard({
  title,
  category,
  description,
  vehicleId,
  parts,
  vehicles,
}: {
  title: string;
  category: string;
  description: string;
  vehicleId: string;
  parts: Part[];
  vehicles: Vehicles;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const installed = parts.find(
    (part) =>
      part.category === category && part.installed_vehicle_id === vehicleId,
  );
  const candidates = parts.filter(
    (part) =>
      part.category === category && part.installed_vehicle_id !== vehicleId,
  );

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({
      partId,
      target,
    }: {
      partId: string;
      target: string | null;
    }) => installPart(partId, target),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GetAllPartsQuery.queryKey });
      setSelected(null);
    },
  });

  return (
    <Card>
      <CardHeader>
        <H3>{title}</H3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {installed ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex flex-col">
              <p>{installed.name}</p>
              <p className="text-sm text-muted-foreground">
                {installed.part_number}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${installed.name}`}
              disabled={mutation.isPending}
              onClick={() =>
                mutation.mutate({ partId: installed.id, target: null })
              }
            >
              <XIcon />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {candidates.length > 0 ? (
              <Select
                value={selected}
                disabled={mutation.isPending}
                onValueChange={(partId) => {
                  setSelected(partId);
                  if (partId) mutation.mutate({ partId, target: vehicleId });
                }}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a part" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((part) => {
                    const installedVehicle = vehicles.find(
                      (vehicle) => vehicle.id === part.installed_vehicle_id,
                    );
                    return (
                      <SelectItem key={part.id} value={part.id}>
                        {part.name}
                        {installedVehicle && ` (on ${installedVehicle.name})`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            ) : (
              <p className="flex-1 text-sm text-muted-foreground">
                No {title} parts in your inventory yet.
              </p>
            )}
            <AddRigPartDialog category={category} vehicleId={vehicleId} />
          </div>
        )}
        {mutation.isError && (
          <p className="text-sm text-destructive">
            Failed to update. Please try again.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
