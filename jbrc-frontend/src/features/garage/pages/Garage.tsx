import H1 from "@/components/H1";
import { useQuery } from "@tanstack/react-query";
import VehicleCard from "../components/VehicleCard";
import { GetAllVehiclesQuery } from "../queries/GetAllVehicles";

export default function Garage() {
  const { data: vehicles } = useQuery(GetAllVehiclesQuery);

  return (
    <div className="flex flex-col gap-4">
      <H1>Welcome, Josiah</H1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        {vehicles?.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </div>
  );
}
