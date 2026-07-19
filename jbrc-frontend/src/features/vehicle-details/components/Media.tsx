import H2 from "@/components/H2";
import type { Vehicle } from "@/features/garage/schemas/GetVehicles";
import VehicleThumbnail from "./VehicleThumbnail";

export default function Media({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="flex flex-col gap-3">
      <H2>Thumbnail</H2>
      <VehicleThumbnail vehicle={vehicle} />
      <H2>Media</H2>
    </div>
  );
}
