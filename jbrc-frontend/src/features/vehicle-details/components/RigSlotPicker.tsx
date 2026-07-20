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
import { useState } from "react";
import { installPart } from "../queries/installPart";
import AddRigPartDialog from "./AddRigPartDialog";

// Dropdown of uninstalled parts in a category plus an add-new dialog;
// selecting a part installs it on the vehicle (moving it if it is
// currently on another one).
export default function RigSlotPicker({
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
  const [selected, setSelected] = useState<string | null>(null);

  const candidates = parts.filter(
    (part) =>
      part.category === category && part.installed_vehicle_id !== vehicleId,
  );

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (partId: string) => installPart(partId, vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GetAllPartsQuery.queryKey });
      setSelected(null);
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {candidates.length > 0 ? (
          <Select
            value={selected}
            disabled={mutation.isPending}
            onValueChange={(partId) => {
              setSelected(partId);
              if (partId) mutation.mutate(partId);
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
            No {category} parts in your inventory yet.
          </p>
        )}
        <AddRigPartDialog category={category} vehicleId={vehicleId} />
      </div>
      {mutation.isError && (
        <p className="text-sm text-destructive">
          Failed to install part. Please try again.
        </p>
      )}
    </div>
  );
}
