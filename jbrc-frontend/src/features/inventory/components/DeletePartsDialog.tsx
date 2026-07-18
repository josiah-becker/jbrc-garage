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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2Icon, UnlinkIcon } from "lucide-react";
import { useState } from "react";
import { GetAllPartsQuery } from "../queries/allPartsQuery";
import { deleteParts, unlinkVehicleParts } from "../queries/deleteParts";

// When `vehicleId` is set, the dialog removes the selected parts from that
// vehicle's compatibility list instead of deleting them from the inventory.
export default function DeletePartsDialog({
  selectedIds,
  onDeleted,
  vehicleId,
}: {
  selectedIds: string[];
  onDeleted: () => void;
  vehicleId?: string;
}) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (ids: string[]) =>
      vehicleId ? unlinkVehicleParts(vehicleId, ids) : deleteParts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GetAllPartsQuery.queryKey });
      setOpen(false);
      onDeleted();
    },
  });

  const isUnlink = !!vehicleId;
  const plural = selectedIds.length === 1 ? "" : "s";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button variant="destructive">
            {isUnlink ? <UnlinkIcon /> : <Trash2Icon />}
            {isUnlink ? "Remove" : "Delete"} {selectedIds.length} selected
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isUnlink
              ? `Remove ${selectedIds.length} part${plural} from this vehicle?`
              : `Delete ${selectedIds.length} part${plural}?`}
          </DialogTitle>
          <DialogDescription>
            {isUnlink
              ? `The selected part${plural} will no longer be marked as compatible with this vehicle, but will stay in your inventory.`
              : `This will permanently remove the selected part${plural} from your inventory and any vehicle associations. This action cannot be undone.`}
          </DialogDescription>
        </DialogHeader>
        {mutation.isError && (
          <p className="text-sm text-destructive">
            Failed to {isUnlink ? "remove" : "delete"} parts. Please try again.
          </p>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate(selectedIds)}
          >
            {mutation.isPending
              ? isUnlink
                ? "Removing..."
                : "Deleting..."
              : isUnlink
                ? "Remove"
                : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
