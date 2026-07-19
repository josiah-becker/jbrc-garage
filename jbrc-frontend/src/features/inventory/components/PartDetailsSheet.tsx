import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { GetAllVehiclesQuery } from "@/features/garage/queries/GetAllVehicles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useState } from "react";
import { GetAllPartsQuery } from "../queries/allPartsQuery";
import { updatePart } from "../queries/updatePart";
import type { Part, PartQuantity } from "../schemas/GetAllParts";

const emptyQuantity: PartQuantity = { total: 0, new: 0, used: 0 };

function toDerivedQuantity(quantity: PartQuantity): PartQuantity {
  return { ...quantity, total: quantity.new + quantity.used };
}

// Keyed by part.id from the parent so this remounts (and re-seeds its form
// state from props) whenever a different part is selected.
function PartEditForm({ part, onSaved }: { part: Part; onSaved: () => void }) {
  const [form, setForm] = useState({
    part_number: part.part_number,
    name: part.name,
    category: part.category,
    notes: part.notes ?? "",
  });
  const [quantity, setQuantity] = useState<PartQuantity>(() =>
    toDerivedQuantity(part.quantity ?? emptyQuantity),
  );
  const [vehicleIds, setVehicleIds] = useState<string[]>(() =>
    part.vehicles.map((vehicle) => vehicle.id),
  );

  const { data: vehicles = [] } = useQuery(GetAllVehiclesQuery);

  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () =>
      updatePart(part.id, {
        part_number: form.part_number,
        name: form.name,
        category: form.category,
        notes: form.notes || null,
        quantity: toDerivedQuantity(quantity),
        vehicle_ids: vehicleIds,
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

  function updateQuantity(next: Partial<Pick<PartQuantity, "new" | "used">>) {
    setQuantity((current) =>
      toDerivedQuantity({
        ...current,
        ...next,
      }),
    );
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
            onChange={(e) => setForm({ ...form, part_number: e.target.value })}
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
          <p className="text-sm text-muted-foreground">{part.brand ?? "N/A"}</p>
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
                readOnly
                disabled
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
                  updateQuantity({ new: Number(e.target.value) })
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
                  updateQuantity({ used: Number(e.target.value) })
                }
              />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-vehicles">Compatible vehicles</Label>
          <Select
            multiple
            value={vehicleIds}
            onValueChange={(value) => setVehicleIds(value)}
          >
            <SelectTrigger id="edit-vehicles" className="w-full">
              <SelectValue placeholder="None selected">
                {(value: string[]) =>
                  value.length === 0
                    ? "None selected"
                    : vehicles
                        .filter((vehicle) => value.includes(vehicle.id))
                        .map((vehicle) => vehicle.name)
                        .join(", ")
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  {vehicle.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
