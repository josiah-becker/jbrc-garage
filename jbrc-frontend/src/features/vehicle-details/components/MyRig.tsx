import H2 from "@/components/H2";
import { GetAllVehiclesQuery } from "@/features/garage/queries/GetAllVehicles";
import { GetAllPartsQuery } from "@/features/inventory/queries/allPartsQuery";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import DifferentialsCard from "./DifferentialsCard";
import EscCard from "./EscCard";
import MotorCard from "./MotorCard";
import ReceiverCard from "./ReceiverCard";
import ServoCard from "./ServoCard";
import SuspensionCard from "./ShocksCard";

export default function MyRig({ vehicleId }: { vehicleId: string }) {
  const { data: parts } = useSuspenseQuery(GetAllPartsQuery);
  const { data: vehicles = [] } = useQuery(GetAllVehiclesQuery);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <H2>My Rig</H2>
        <p className="text-sm text-muted-foreground">
          Here you can configure the current set up of your rig.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <MotorCard vehicleId={vehicleId} parts={parts} vehicles={vehicles} />
        <EscCard vehicleId={vehicleId} parts={parts} vehicles={vehicles} />
        <ServoCard vehicleId={vehicleId} parts={parts} vehicles={vehicles} />
        <ReceiverCard vehicleId={vehicleId} parts={parts} vehicles={vehicles} />
        <DifferentialsCard
          vehicleId={vehicleId}
          parts={parts}
          vehicles={vehicles}
        />
        <SuspensionCard
          vehicleId={vehicleId}
          parts={parts}
          vehicles={vehicles}
        />
      </div>
    </div>
  );
}
