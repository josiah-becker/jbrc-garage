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
import { GetAllSessionsQuery } from "../queries/GetAllSessions";
import { updateSession } from "../queries/updateSession";
import type { Session } from "../schemas/GetSessions";
import VehiclePicker from "./VehiclePicker";

// Rendered inside DialogContent so it remounts (and re-seeds its form state
// from props) each time the dialog opens.
function EditSessionForm({
  session,
  onSaved,
}: {
  session: Session;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: session.name,
    session_date: session.session_date,
    location: session.location ?? "",
    notes: session.notes ?? "",
  });
  const [vehicleIds, setVehicleIds] = useState<string[]>(
    session.vehicles.map((vehicle) => vehicle.id),
  );

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () =>
      updateSession(session.id, {
        name: form.name,
        session_date: form.session_date,
        location: form.location || null,
        notes: form.notes || null,
        vehicle_ids: vehicleIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GetAllSessionsQuery.queryKey });
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
        <DialogTitle>Edit session</DialogTitle>
        <DialogDescription>
          Update the details for {session.name}.
        </DialogDescription>
      </DialogHeader>
      <form
        id="edit-session-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-session-name">Name</Label>
          <Input
            id="edit-session-name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-session-date">Date</Label>
          <Input
            id="edit-session-date"
            type="date"
            required
            value={form.session_date}
            onChange={(e) =>
              setForm({ ...form, session_date: e.target.value })
            }
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-session-location">Location</Label>
          <Input
            id="edit-session-location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label>Vehicles used</Label>
          <VehiclePicker selected={vehicleIds} onChange={setVehicleIds} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="edit-session-notes">Notable events</Label>
          <Textarea
            id="edit-session-notes"
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
          form="edit-session-form"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Saving..." : "Save changes"}
        </Button>
      </DialogFooter>
    </>
  );
}

export default function EditSessionDialog({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="outline">
            <PencilIcon /> <span className="hidden md:inline">Edit</span>
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <EditSessionForm session={session} onSaved={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
