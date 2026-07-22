import H3 from "@/components/H3";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Vehicles } from "@/features/garage/schemas/GetVehicles";
import type { Part } from "@/features/inventory/schemas/GetAllParts";
import { DIFFERENTIAL_CATEGORY } from "@/features/inventory/lib/differentials";
import RigSlotPicker from "./RigSlotPicker";
import TuneDifferentialDialog from "./TuneDifferentialDialog";

const CATEGORY = DIFFERENTIAL_CATEGORY;

// Renders the tuned-in sealed/oil state for an installed differential, or
// nothing if it hasn't been tuned yet.
function DifferentialSummary({ part, parts }: { part: Part; parts: Part[] }) {
  const details = part.details;
  if (!details || Object.keys(details).length === 0) return null;

  const sealed = typeof details.sealed === "boolean" ? details.sealed : null;
  const oilId =
    typeof details.oil_part_id === "string" ? details.oil_part_id : null;
  const oil = oilId ? parts.find((p) => p.id === oilId) : null;

  const bits: string[] = [];
  if (sealed !== null) bits.push(sealed ? "Sealed" : "Not sealed");
  if (oilId) bits.push(oil ? oil.name : "Unknown oil");
  if (bits.length === 0) return null;

  return <p className="text-sm text-muted-foreground">{bits.join(" · ")}</p>;
}

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
          renderPartExtra={(part) => (
            <TuneDifferentialDialog part={part} parts={parts} />
          )}
          renderPartSubtext={(part) => (
            <DifferentialSummary part={part} parts={parts} />
          )}
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
