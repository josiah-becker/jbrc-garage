import VehicleDetail from "@/features/vehicle-details/pages/VehicleDetail";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/vehicles/$vehicleId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { vehicleId } = Route.useParams();
  return <VehicleDetail vehicleId={vehicleId} />;
}
