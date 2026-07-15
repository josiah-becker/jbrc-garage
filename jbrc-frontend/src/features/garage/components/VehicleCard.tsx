import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Vehicle } from "../schemas/GetVehicles";

export default function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
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
          src={`src/assets/thumbnails/${vehicle.name.toLowerCase()}_thumbnail.jpeg`}
          alt="Vehicle"
        />
      </CardContent>
    </Card>
  );
}
