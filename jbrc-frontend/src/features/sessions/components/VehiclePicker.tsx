import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { GetAllVehiclesQuery } from "@/features/garage/queries/GetAllVehicles";
import { useQuery } from "@tanstack/react-query";

export default function VehiclePicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const { data: vehicles, isPending, isError } = useQuery(GetAllVehiclesQuery);

  if (isPending) return <Skeleton className="h-24 w-full" />;
  if (isError)
    return (
      <p className="text-sm text-destructive">Failed to load vehicles.</p>
    );

  if (vehicles.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Add a vehicle to your garage first.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {vehicles.map((vehicle) => {
        const checked = selected.includes(vehicle.id);
        return (
          <label
            key={vehicle.id}
            className="flex items-center gap-2 text-sm"
          >
            <Checkbox
              checked={checked}
              onCheckedChange={(isChecked) =>
                onChange(
                  isChecked
                    ? [...selected, vehicle.id]
                    : selected.filter((id) => id !== vehicle.id),
                )
              }
            />
            {vehicle.name}{" "}
            <span className="text-muted-foreground">
              &middot; {vehicle.brand}
            </span>
          </label>
        );
      })}
    </div>
  );
}
