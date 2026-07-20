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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Vehicles } from "@/features/garage/schemas/GetVehicles";
import { GetAllPartsQuery } from "@/features/inventory/queries/allPartsQuery";
import { createParts } from "@/features/inventory/queries/createPart";
import type { Part } from "@/features/inventory/schemas/GetAllParts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import { installPart } from "../queries/installPart";

const emptyForm = {
  part_number: "",
  name: "",
  brand: "",
  notes: "",
};

// Installs a part in the given category on the vehicle: either an existing
// part from the inventory (installing marks it compatible) or a newly
// created one.
export default function AddRigPartDialog({
  category,
  vehicleId,
  parts,
  vehicles,
}: {
  category: string;
  vehicleId: string;
  parts: Part[];
  vehicles: Vehicles;
}) {
  const candidates = parts.filter(
    (part) =>
      part.category === category &&
      part.installed_vehicle_id !== vehicleId &&
      !part.consumable,
  );

  const defaultMode = candidates.length > 0 ? "existing" : "new";
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"existing" | "new">(defaultMode);
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const idPrefix = category.toLowerCase().replace(/\s+/g, "-");

  const queryClient = useQueryClient();

  function onInstalled() {
    queryClient.invalidateQueries({ queryKey: GetAllPartsQuery.queryKey });
    setOpen(false);
    resetForm();
  }

  const createMutation = useMutation({
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
    onSuccess: onInstalled,
  });

  const installMutation = useMutation({
    mutationFn: (partId: string) => installPart(partId, vehicleId),
    onSuccess: onInstalled,
  });

  const pending = createMutation.isPending || installMutation.isPending;

  function resetForm() {
    setForm(emptyForm);
    setSelectedPartId(null);
    setMode(defaultMode);
    createMutation.reset();
    installMutation.reset();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (mode === "existing") {
      if (selectedPartId) installMutation.mutate(selectedPartId);
      return;
    }
    createMutation.mutate();
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
          <Button
            variant="ghost"
            className="text-primary dark:hover:text-primary dark:hover:bg-primary/10"
          >
            <PlusIcon />
            Install new {category}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Install {category}</DialogTitle>
          <DialogDescription>
            Choose an existing part from your inventory, or create a new one.
            New parts are added to your inventory and installed on this vehicle.
          </DialogDescription>
        </DialogHeader>
        <form
          id={`add-${idPrefix}-part-form`}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "existing" | "new")}
          >
            <TabsList className="w-full">
              <TabsTrigger value="existing">Choose existing</TabsTrigger>
              <TabsTrigger value="new">Create new</TabsTrigger>
            </TabsList>
            <TabsContent value="existing" className="flex flex-col gap-3 pt-2">
              {candidates.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor={`${idPrefix}-existing-part`}>Part</Label>
                  <Select
                    required
                    value={selectedPartId}
                    onValueChange={(value) => setSelectedPartId(value)}
                  >
                    <SelectTrigger
                      id={`${idPrefix}-existing-part`}
                      className="w-full"
                    >
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
                            {installedVehicle &&
                              ` (on ${installedVehicle.name})`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No spare {category} parts in your inventory. Create a new one
                  instead.
                </p>
              )}
            </TabsContent>
            <TabsContent value="new" className="flex flex-col gap-3 pt-2">
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
            </TabsContent>
          </Tabs>
          {(createMutation.isError || installMutation.isError) && (
            <p className="text-sm text-destructive">
              Failed to install part. Please try again.
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
            disabled={
              pending || (mode === "existing" && candidates.length === 0)
            }
          >
            {pending ? "Installing..." : "Install part"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
