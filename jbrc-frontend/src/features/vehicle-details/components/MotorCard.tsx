import H3 from "@/components/H3";
import H4 from "@/components/H4";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Vehicles } from "@/features/garage/schemas/GetVehicles";
import type { Part } from "@/features/inventory/schemas/GetAllParts";
import RigSlotPicker from "./RigSlotPicker";

const CATEGORY_MOTOR = "Motor";
const CATEGORY_PINION = "Pinion";
const CATEGORY_SPUR = "Spur";

export default function MotorCard({
  vehicleId,
  parts,
  vehicles,
}: {
  vehicleId: string;
  parts: Part[];
  vehicles: Vehicles;
}) {
  const installedMotor = parts.find(
    (part) =>
      part.category === CATEGORY_MOTOR &&
      part.installed_vehicle_id === vehicleId,
  );

  const installedPinion = parts.find(
    (part) =>
      part.category === CATEGORY_PINION &&
      part.installed_vehicle_id === vehicleId,
  );

  const installedSpur = parts.find(
    (part) =>
      part.category === CATEGORY_SPUR &&
      part.installed_vehicle_id === vehicleId,
  );

  return (
    <Card>
      <CardHeader>
        <H3>Motor</H3>
        <p className="text-sm text-muted-foreground">
          The motor is the heart of your rig. Make sure to choose the right one
          for your needs.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <H4>Motor</H4>
        <RigSlotPicker
          category={CATEGORY_MOTOR}
          vehicleId={vehicleId}
          parts={parts}
          vehicles={vehicles}
          installedPart={installedMotor}
        />
        <H4>Pinion</H4>
        <RigSlotPicker
          category={CATEGORY_PINION}
          vehicleId={vehicleId}
          parts={parts}
          vehicles={vehicles}
          installedPart={installedPinion}
        />
        <H4>Spur</H4>
        <RigSlotPicker
          category={CATEGORY_SPUR}
          vehicleId={vehicleId}
          parts={parts}
          vehicles={vehicles}
          installedPart={installedSpur}
        />
      </CardContent>
    </Card>
  );
}
