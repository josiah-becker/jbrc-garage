import DataTable from "@/components/data-table";
import AddPartsDialog from "@/features/inventory/components/AddPartsDialog";
import {
  categoryColumn,
  nameColumn,
  notesColumn,
  partNumberColumn,
} from "@/features/inventory/lib/partsColumns";
import { GetAllPartsQuery } from "@/features/inventory/queries/allPartsQuery";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

const columns = [partNumberColumn, nameColumn, categoryColumn, notesColumn];

export default function Parts({ vehicleId }: { vehicleId: string }) {
  "use no memo";
  const { data: parts } = useSuspenseQuery(GetAllPartsQuery);
  const [sorting, setSorting] = useState<SortingState>([]);

  const vehicleParts = useMemo(
    () =>
      parts.filter((part) =>
        part.vehicles.some((vehicle) => vehicle.id === vehicleId),
      ),
    [parts, vehicleId],
  );

  const table = useReactTable({
    data: vehicleParts,
    columns,
    state: { sorting },
    getRowId: (part) => part.id,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <AddPartsDialog defaultVehicleId={vehicleId} />
      </div>
      {vehicleParts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No parts linked to this vehicle yet.
        </p>
      ) : (
        <DataTable table={table} />
      )}
    </div>
  );
}
