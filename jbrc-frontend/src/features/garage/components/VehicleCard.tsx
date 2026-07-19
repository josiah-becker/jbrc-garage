import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getVehicleThumbnailUrl } from "@/lib/media";
import { Link } from "@tanstack/react-router";
import type { Vehicle } from "../schemas/GetVehicles";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link to="/vehicles/$vehicleId" params={{ vehicleId: vehicle.id }}>
      <Card>
        <CardHeader>
          <CardTitle>{vehicle.name}</CardTitle>
          <CardDescription>
            {vehicle.brand} &middot; {vehicle.scale}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <img
            className="w-full aspect-square object-cover bg-accent rounded-xl"
            src={getVehicleThumbnailUrl(vehicle.id)}
            alt={`Thumbnail of ${vehicle.name}`}
          />
        </CardContent>
      </Card>
    </Link>
  );
}
