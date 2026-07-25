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
import { PlusIcon } from "lucide-react";
import { type FormEvent, useState } from "react";
import { GetAllSessionsQuery } from "../queries/GetAllSessions";
import { createSession } from "../queries/createSession";
import VehiclePicker from "./VehiclePicker";

const emptyForm = {
  name: "",
  session_date: "",
  location: "",
  notes: "",
};

export default function AddSessionDialog() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [vehicleIds, setVehicleIds] = useState<string[]>([]);

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      createSession({
        name: form.name,
        session_date: form.session_date,
        location: form.location || null,
        notes: form.notes || null,
        vehicle_ids: vehicleIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GetAllSessionsQuery.queryKey });
      setOpen(false);
      resetForm();
    },
  });

  function resetForm() {
    setForm(emptyForm);
    setVehicleIds([]);
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
            <PlusIcon /> Add session
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add session</DialogTitle>
          <DialogDescription>
            Log a drive day: when, where, which vehicles, and anything worth
            remembering.
          </DialogDescription>
        </DialogHeader>
        <form
          id="add-session-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="session-name">Name</Label>
            <Input
              id="session-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="session-date">Date</Label>
            <Input
              id="session-date"
              type="date"
              required
              value={form.session_date}
              onChange={(e) =>
                setForm({ ...form, session_date: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="session-location">Location</Label>
            <Input
              id="session-location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Vehicles used</Label>
            <VehiclePicker selected={vehicleIds} onChange={setVehicleIds} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="session-notes">Notable events</Label>
            <Textarea
              id="session-notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>
          {mutation.isError && (
            <p className="text-sm text-destructive">
              Failed to add session. Please try again.
            </p>
          )}
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form="add-session-form"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Adding..." : "Add session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
