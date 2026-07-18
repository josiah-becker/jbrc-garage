import H1 from "@/components/H1";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getVehicleThumbnail } from "../../garage/lib/thumbnails";
import Parts from "../components/Parts";
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
      <Tabs>
        <TabsList variant="line" className="w-full max-w-md">
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="repairs">Repairs</TabsTrigger>
        </TabsList>
        <TabsContent value="media">
          <img
            className="w-full max-w-md aspect-square object-cover bg-accent rounded-xl"
            src={getVehicleThumbnail(vehicle.name)}
            alt="Vehicle"
          />
        </TabsContent>
        <TabsContent value="details">
          <p>Details content goes here.</p>
        </TabsContent>
        <TabsContent value="parts">
          <Parts vehicleId={vehicleId} />
        </TabsContent>
        <TabsContent value="repairs">
          <p>Repairs content goes here.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
