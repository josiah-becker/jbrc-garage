import H3 from "@/components/H3";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Vehicles } from "@/features/garage/schemas/GetVehicles";
import type { Part } from "@/features/inventory/schemas/GetAllParts";
import RigSlotPicker from "./RigSlotPicker";

const CATEGORY = "Differentials";

export default function DifferentialsCard({
  vehicleId,
  parts,
  vehicles,
}: {
  vehicleId: string;
  parts: Part[];
  vehicles: Vehicles;
}) {
  const installed = parts.filter(
    (part) =>
      part.category === CATEGORY && part.installed_vehicle_id === vehicleId,
  );

  return (
    <Card>
      <CardHeader>
        <H3>Differentials</H3>
        <p className="text-sm text-muted-foreground">
          Differentials are responsible for distributing power to the wheels.
          Make sure to choose the right ones for your needs.
        </p>
      </CardHeader>
      <CardContent>
        {installed.map((part) => (
          <RigSlotPicker
            key={part.id}
            category={CATEGORY}
            vehicleId={vehicleId}
            parts={parts}
            vehicles={vehicles}
            installedPart={part}
          />
        ))}
        <RigSlotPicker
          category={CATEGORY}
          vehicleId={vehicleId}
          parts={parts}
          vehicles={vehicles}
        />
        {/* <RigSlotPicker
          category={CATEGORY}
          vehicleId={vehicleId}
          parts={parts}
          vehicles={vehicles}
        /> */}
      </CardContent>
    </Card>
  );
}
