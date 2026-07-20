import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Vehicles } from "@/features/garage/schemas/GetVehicles";
import { GetAllPartsQuery } from "@/features/inventory/queries/allPartsQuery";
import type { Part } from "@/features/inventory/schemas/GetAllParts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { useState } from "react";
import { installPart } from "../queries/installPart";
import AddRigPartDialog from "./AddRigPartDialog";

// Dropdown for one rig slot plus an add-new dialog. With no installed part,
// selecting a part installs it (moving it if it is currently on another
// vehicle). With an installed part, the dropdown shows it as the current
// value and selecting a different part swaps it out; the X button
// uninstalls it back to a spare.
export default function RigSlotPicker({
  category,
  vehicleId,
  parts,
  vehicles,
  installedPart,
}: {
  category: string;
  vehicleId: string;
  parts: Part[];
  vehicles: Vehicles;
  installedPart?: Part;
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const candidates = parts.filter(
    (part) =>
      part.category === category &&
      part.installed_vehicle_id !== vehicleId &&
      !part.consumable &&
      part.vehicles.some((vehicle) => vehicle.id === vehicleId),
  );

  const queryClient = useQueryClient();

  const swapMutation = useMutation({
    mutationFn: async (partId: string) => {
      if (installedPart) await installPart(installedPart.id, null);
      return installPart(partId, vehicleId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: GetAllPartsQuery.queryKey,
      });
      setSelected(null);
    },
    onError: () => setSelected(null),
  });

  const removeMutation = useMutation({
    mutationFn: (partId: string) => installPart(partId, null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GetAllPartsQuery.queryKey });
    },
  });

  const pending = swapMutation.isPending || removeMutation.isPending;
  const value = selected ?? installedPart?.id ?? null;

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-[1fr_auto] items-center gap-2">
        {installedPart || candidates.length > 0 ? (
          <Select
            value={value}
            disabled={pending}
            onValueChange={(partId) => {
              if (!partId || partId === installedPart?.id) return;
              setSelected(partId);
              swapMutation.mutate(partId);
            }}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a part">
                {(partId: string | null) => {
                  const part = parts.find(
                    (candidate) => candidate.id === partId,
                  );
                  if (!part) return "Select a part";
                  const details = [part.brand, part.part_number]
                    .filter(Boolean)
                    .join(" · ");
                  return (
                    <span className="flex items-baseline gap-2">
                      <span>{part.name}</span>
                      {details && (
                        <span className="text-xs text-muted-foreground">
                          {details}
                        </span>
                      )}
                    </span>
                  );
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {installedPart && (
                <SelectItem value={installedPart.id}>
                  {installedPart.name}
                </SelectItem>
              )}
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
            Add {category} to your inventory...
          </p>
        )}
        {installedPart && (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Remove ${installedPart.name}`}
            disabled={pending}
            onClick={() => removeMutation.mutate(installedPart.id)}
          >
            <XIcon />
          </Button>
        )}
        <AddRigPartDialog category={category} vehicleId={vehicleId} />
      </div>
      {swapMutation.isError && (
        <p className="text-sm text-destructive">
          Failed to install part. Please try again.
        </p>
      )}
      {removeMutation.isError && (
        <p className="text-sm text-destructive">
          Failed to remove part. Please try again.
        </p>
      )}
    </div>
  );
}
