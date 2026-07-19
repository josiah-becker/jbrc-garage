import type { Vehicle } from "@/features/garage/schemas/GetVehicles";
import VehicleManual from "./VehicleManual";

export default function Details({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Brand</p>
        <p>{vehicle.brand}</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Scale</p>
        <p>{vehicle.scale}</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Purchase date</p>
        <p>
          {vehicle.purchase_date
            ? new Date(vehicle.purchase_date).toLocaleDateString(undefined, {
                timeZone: "UTC",
              })
            : "N/A"}
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Notes</p>
        <p>{vehicle.notes}</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Product manual</p>
        <VehicleManual vehicleId={vehicle.id} />
      </div>
    </div>
  );
}
