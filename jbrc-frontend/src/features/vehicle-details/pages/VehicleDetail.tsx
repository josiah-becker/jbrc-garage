import H1 from "@/components/H1";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import DeleteVehicleDialog from "../../garage/components/DeleteVehicleDialog";
import EditVehicleDialog from "../../garage/components/EditVehicleDialog";
import Details from "../components/Details";
import Media from "../components/Media";
import MyRig from "../components/MyRig";
import SpareParts from "../components/SpareParts";
import { GetVehicleQuery } from "../queries/GetVehicle";

export default function VehicleDetail({ vehicleId }: { vehicleId: string }) {
  const navigate = useNavigate();
  const {
    data: vehicle,
    isPending,
    isError,
  } = useQuery(GetVehicleQuery(vehicleId));
  if (isPending) return <Skeleton className="w-full h-64" />;
  if (isError) return <p>Vehicle not found.</p>;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <H1>{vehicle.name}</H1>
          <p className="text-muted-foreground">
            {vehicle.brand} &middot; {vehicle.scale}
          </p>
        </div>
        <div className="flex gap-2">
          <EditVehicleDialog vehicle={vehicle} />
          <DeleteVehicleDialog
            vehicleId={vehicleId}
            vehicleName={vehicle.name}
            onDeleted={() => navigate({ to: "/" })}
          />
        </div>
      </div>

      <Tabs>
        <TabsList variant="line" className="w-full max-w-md">
          <TabsTrigger value="my-rig">My Rig</TabsTrigger>
          <TabsTrigger value="spare-parts">Spare Parts</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="my-rig" className="flex flex-col gap-3">
          <MyRig vehicleId={vehicleId} />
        </TabsContent>
        <TabsContent value="spare-parts">
          <SpareParts vehicleId={vehicleId} />
        </TabsContent>
        <TabsContent value="maintenance">
          <p>Maintenance content goes here.</p>
        </TabsContent>
        <TabsContent value="media" className="flex flex-col gap-3">
          <Media vehicle={vehicle} />
        </TabsContent>
        <TabsContent value="details" className="flex flex-col gap-3">
          <Details vehicle={vehicle} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
