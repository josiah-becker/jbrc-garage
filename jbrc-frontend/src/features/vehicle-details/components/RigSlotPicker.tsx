import { Button } from "@/components/ui/button";
import type { Vehicles } from "@/features/garage/schemas/GetVehicles";
import { GetAllPartsQuery } from "@/features/inventory/queries/allPartsQuery";
import type { Part } from "@/features/inventory/schemas/GetAllParts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import type { ReactNode } from "react";
import { installPart } from "../queries/installPart";
import AddRigPartDialog from "./AddRigPartDialog";

// One rig category. Every installed part is shown as text with an
// uninstall button that returns it to the spares. Below them, a dropdown
// of compatible spares installs another part (moving it if it is currently
// on another vehicle), and the install-new dialog covers the rest of the
// inventory.
export default function RigSlotPicker({
  category,
  vehicleId,
  parts,
  vehicles,
  renderPartExtra,
  renderPartSubtext,
}: {
  category: string;
  vehicleId: string;
  parts: Part[];
  vehicles: Vehicles;
  renderPartExtra?: (part: Part) => ReactNode;
  renderPartSubtext?: (part: Part) => ReactNode;
}) {
  const installed = parts.filter(
    (part) =>
      part.category === category && part.installed_vehicle_id === vehicleId,
  );

  const queryClient = useQueryClient();

  const installMutation = useMutation({
    mutationFn: (partId: string) => installPart(partId, vehicleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: GetAllPartsQuery.queryKey,
      });
    },
    onError: () => {
      console.error("Failed to install part. Please try again.");
    },
  });

  const removeMutation = useMutation({
    mutationFn: (partId: string) => installPart(partId, null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GetAllPartsQuery.queryKey });
    },
  });

  const pending = installMutation.isPending || removeMutation.isPending;

  return (
    <div className="flex flex-col gap-2">
      {installed.length > 0 ? (
        installed.map((part) => {
          const details = [part.brand, part.part_number]
            .filter(Boolean)
            .join(" · ");
          return (
            <div
              key={part.id}
              className="flex items-center justify-between gap-2 hover:bg-muted px-2 py-1 rounded-md transition-colors"
            >
              <div className="flex flex-col">
                <p>{part.name}</p>
                {details && (
                  <p className="text-sm text-muted-foreground">{details}</p>
                )}
                {renderPartSubtext?.(part)}
              </div>
              <div className="flex items-center gap-1">
                {renderPartExtra?.(part)}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${part.name}`}
                  disabled={pending}
                  onClick={() => removeMutation.mutate(part.id)}
                >
                  <XIcon />
                </Button>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-muted-foreground">
          No {category} installed.
        </p>
      )}
      <div>
        <AddRigPartDialog
          category={category}
          vehicleId={vehicleId}
          parts={parts}
          vehicles={vehicles}
        />
      </div>
      {installMutation.isError && (
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
