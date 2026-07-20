import H3 from "@/components/H3";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Vehicles } from "@/features/garage/schemas/GetVehicles";
import type { Part } from "@/features/inventory/schemas/GetAllParts";
import InstalledRigPart from "./InstalledRigPart";
import RigSlotPicker from "./RigSlotPicker";

const CATEGORY = "ESC";

export default function EscCard({
  vehicleId,
  parts,
  vehicles,
}: {
  vehicleId: string;
  parts: Part[];
  vehicles: Vehicles;
}) {
  const installed = parts.find(
    (part) =>
      part.category === CATEGORY && part.installed_vehicle_id === vehicleId,
  );

  return (
    <Card>
      <CardHeader>
        <H3>ESC</H3>
        <p className="text-sm text-muted-foreground">
          The ESC (Electronic Speed Controller) is responsible for controlling
          the speed of your motor. Make sure to choose the right one for your
          needs.
        </p>
      </CardHeader>
      <CardContent>
        {installed ? (
          <InstalledRigPart part={installed} />
        ) : (
          <RigSlotPicker
            category={CATEGORY}
            vehicleId={vehicleId}
            parts={parts}
            vehicles={vehicles}
          />
        )}
      </CardContent>
    </Card>
  );
}
