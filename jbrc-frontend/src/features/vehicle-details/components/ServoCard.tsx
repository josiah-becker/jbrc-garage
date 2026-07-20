import H3 from "@/components/H3";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Vehicles } from "@/features/garage/schemas/GetVehicles";
import type { Part } from "@/features/inventory/schemas/GetAllParts";
import RigSlotPicker from "./RigSlotPicker";

const CATEGORY = "Servo";

export default function ServoCard({
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
        <H3>Servo</H3>
        <p className="text-sm text-muted-foreground">
          The servo is responsible for controlling the steering of your rig.
          Make sure to choose the right one for your needs.
        </p>
      </CardHeader>
      <CardContent>
        <RigSlotPicker
          category={CATEGORY}
          vehicleId={vehicleId}
          parts={parts}
          vehicles={vehicles}
          installedPart={installed}
        />
      </CardContent>
    </Card>
  );
}
