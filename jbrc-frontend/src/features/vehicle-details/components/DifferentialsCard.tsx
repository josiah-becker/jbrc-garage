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
