import H1 from "@/components/H1";
import VehicleCard from "@/features/garage/components/VehicleCard";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="flex flex-col gap-4">
      <H1>Welcome, Josiah</H1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <VehicleCard />
        <VehicleCard />
        <VehicleCard />
        <VehicleCard />
        <VehicleCard />
        <VehicleCard />
        <VehicleCard />
        <VehicleCard />
      </div>
    </div>
  );
}
