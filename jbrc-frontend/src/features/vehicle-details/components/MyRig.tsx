import H2 from "@/components/H2";
import { GetAllVehiclesQuery } from "@/features/garage/queries/GetAllVehicles";
import { GetAllPartsQuery } from "@/features/inventory/queries/allPartsQuery";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import RigSlotCard from "./RigSlotCard";

const slots = [
  {
    title: "Motor",
    category: "Motor",
    description:
      "The motor is the heart of your rig. Make sure to choose the right one for your needs.",
  },
  {
    title: "ESC",
    category: "ESC",
    description:
      "The ESC (Electronic Speed Controller) is responsible for controlling the speed of your motor. Make sure to choose the right one for your needs.",
  },
  {
    title: "Servo",
    category: "Servo",
    description:
      "The servo is responsible for controlling the steering of your rig. Make sure to choose the right one for your needs.",
  },
  {
    title: "Receiver",
    category: "Receiver",
    description:
      "The receiver is responsible for receiving the signals from your transmitter. Make sure to choose the right one for your needs.",
  },
  {
    title: "Differentials",
    category: "Differentials",
    description:
      "Differentials are responsible for distributing power to the wheels. Make sure to choose the right ones for your needs.",
  },
  {
    title: "Shocks",
    category: "Shocks",
    description:
      "Shocks are responsible for absorbing impacts and providing a smooth ride. Make sure to choose the right ones for your needs.",
  },
];

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
        {slots.map((slot) => (
          <RigSlotCard
            key={slot.title}
            vehicleId={vehicleId}
            parts={parts}
            vehicles={vehicles}
            {...slot}
          />
        ))}
      </div>
    </div>
  );
}
