import H1 from "@/components/H1";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { getVehicleThumbnail } from "../lib/thumbnails";
import { GetVehicleQuery } from "../queries/GetVehicle";

export default function VehicleDetail({ vehicleId }: { vehicleId: string }) {
  const {
    data: vehicle,
    isPending,
    isError,
  } = useQuery(GetVehicleQuery(vehicleId));

  if (isPending) return <Skeleton className="w-full h-64" />;
  if (isError) return <p>Vehicle not found.</p>;

  return (
    <div className="flex flex-col gap-4">
      <H1>{vehicle.name}</H1>
      <p className="text-muted-foreground">
        {vehicle.brand} &middot; {vehicle.scale}
      </p>
      <img
        className="w-full max-w-md aspect-square object-cover bg-accent rounded-xl"
        src={getVehicleThumbnail(vehicle.name)}
        alt="Vehicle"
      />
      {vehicle.notes && <p>{vehicle.notes}</p>}
    </div>
  );
}
