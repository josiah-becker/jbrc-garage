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
import { uploadVehiclePhoto } from "@/features/vehicle-details/queries/uploadVehiclePhoto";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";
import { GetAllVehiclesQuery } from "../queries/GetAllVehicles";
import { createVehicle } from "../queries/createVehicle";

const emptyForm = {
  name: "",
  brand: "",
  scale: "",
  purchase_date: "",
  notes: "",
};

export default function AddVehicleDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const vehicle = await createVehicle({
        name: form.name,
        brand: form.brand,
        scale: form.scale,
        purchase_date: form.purchase_date || null,
        notes: form.notes || null,
      });
      if (thumbnail) await uploadVehiclePhoto(vehicle.id, thumbnail);
      return vehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GetAllVehiclesQuery.queryKey });
      setOpen(false);
      resetForm();
    },
  });

  function resetForm() {
    setForm(emptyForm);
    setThumbnail(null);
    setThumbnailPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    mutation.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleThumbnailChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setThumbnail(file);
    setThumbnailPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
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
            <PlusIcon /> Add vehicle
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add vehicle</DialogTitle>
          <DialogDescription>
            Add a vehicle to your garage and optionally set a thumbnail
            photo.
          </DialogDescription>
        </DialogHeader>
        <form
          id="add-vehicle-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vehicle-name">Name</Label>
            <Input
              id="vehicle-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vehicle-brand">Brand</Label>
            <Input
              id="vehicle-brand"
              required
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vehicle-scale">Scale</Label>
            <Input
              id="vehicle-scale"
              required
              placeholder="e.g. 1:10"
              value={form.scale}
              onChange={(e) => setForm({ ...form, scale: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vehicle-purchase-date">Purchase date</Label>
            <Input
              id="vehicle-purchase-date"
              type="date"
              value={form.purchase_date}
              onChange={(e) =>
                setForm({ ...form, purchase_date: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vehicle-notes">Notes</Label>
            <Textarea
              id="vehicle-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vehicle-thumbnail">Thumbnail</Label>
            {thumbnailPreview && (
              <img
                src={thumbnailPreview}
                alt="Thumbnail preview"
                className="w-24 h-24 object-cover rounded-lg bg-accent"
              />
            )}
            <input
              ref={fileInputRef}
              id="vehicle-thumbnail"
              type="file"
              accept="image/*"
              onChange={handleThumbnailChange}
              className="text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-muted file:px-2.5 file:py-1 file:text-sm file:font-medium file:text-foreground"
            />
          </div>
          {mutation.isError && (
            <p className="text-sm text-destructive">
              Failed to add vehicle. Please try again.
            </p>
          )}
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form="add-vehicle-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Adding..." : "Add vehicle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
