import H3 from "@/components/H3";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Vehicles } from "@/features/garage/schemas/GetVehicles";
import type { Part } from "@/features/inventory/schemas/GetAllParts";
import RigSlotPicker from "./RigSlotPicker";

const CATEGORY = "Shocks";

export default function ShocksCard({
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
        <H3>Shocks</H3>
        <p className="text-sm text-muted-foreground">
          Shocks are responsible for absorbing impacts and providing a smooth
          ride. Make sure to choose the right ones for your needs.
        </p>
      </CardHeader>
      <CardContent>
        <RigSlotPicker
          category={CATEGORY}
          vehicleId={vehicleId}
          parts={parts}
          vehicles={vehicles}
        />
      </CardContent>
    </Card>
  );
}
