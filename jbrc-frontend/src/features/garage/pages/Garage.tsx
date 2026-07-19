import H1 from "@/components/H1";
import { Button } from "@/components/ui/button";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import VehicleCard from "../components/VehicleCard";
import { GetAllVehiclesQuery } from "../queries/GetAllVehicles";

export default function Garage() {
  const { data: vehicles } = useSuspenseQuery(GetAllVehiclesQuery);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <H1>Welcome, Josiah</H1>
        <Button>
          <Plus /> Add vehicle
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {vehicles?.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}
