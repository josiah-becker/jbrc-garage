import DataTable from "@/components/data-table";
import H2 from "@/components/H2";
import AddPartsDialog from "@/features/inventory/components/AddPartsDialog";
import DeletePartsDialog from "@/features/inventory/components/DeletePartsDialog";
import PartDetailsSheet from "@/features/inventory/components/PartDetailsSheet";
import PartsFilterSheet from "@/features/inventory/components/PartsFilterSheet";
import PartsSearchInput from "@/features/inventory/components/PartsSearchInput";
import {
  categoryColumn,
  nameColumn,
  notesColumn,
  partNumberColumn,
  partsSearchFilterFn,
  quantityColumn,
  selectColumn,
} from "@/features/inventory/lib/partsColumns";
import { GetAllPartsQuery } from "@/features/inventory/queries/allPartsQuery";
import type { Part } from "@/features/inventory/schemas/GetAllParts";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

const columns = [
  selectColumn,
  partNumberColumn,
  nameColumn,
  categoryColumn,
  quantityColumn,
  notesColumn,
];

export default function SpareParts({ vehicleId }: { vehicleId: string }) {
  "use no memo";
  const { data: parts } = useSuspenseQuery(GetAllPartsQuery);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [editingPart, setEditingPart] = useState<Part | null>(null);

  const vehicleParts = useMemo(
    () =>
      parts.filter((part) =>
        part.vehicles.some((vehicle) => vehicle.id === vehicleId),
      ),
    [parts, vehicleId],
  );

  const categoryOptions = useMemo(
    () => Array.from(new Set(vehicleParts.map((part) => part.category))).sort(),
    [vehicleParts],
  );

  const columnFilters: ColumnFiltersState = useMemo(
    () => [{ id: "category", value: selectedCategories }],
    [selectedCategories],
  );

  const selectedIds = Object.entries(rowSelection)
    .filter(([, selected]) => selected)
    .map(([id]) => id);

  const table = useReactTable({
    data: vehicleParts,
    columns,
    state: { sorting, globalFilter, rowSelection, columnFilters },
    getRowId: (part) => part.id,
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: partsSearchFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <H2>Spare Parts</H2>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PartsSearchInput
            parts={vehicleParts}
            value={globalFilter}
            onValueChange={setGlobalFilter}
          />
          {selectedIds.length > 0 && (
            <DeletePartsDialog
              selectedIds={selectedIds}
              onDeleted={() => setRowSelection({})}
              vehicleId={vehicleId}
            />
          )}
        </div>
        <div className="flex gap-2">
          <AddPartsDialog defaultVehicleId={vehicleId} />
          <PartsFilterSheet
            groups={[
              {
                label: "Category",
                options: categoryOptions,
                selected: selectedCategories,
                onChange: setSelectedCategories,
              },
            ]}
          />
        </div>
      </div>
      {vehicleParts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No parts linked to this vehicle yet.
        </p>
      ) : (
        <DataTable table={table} onRowClick={setEditingPart} />
      )}
      <PartDetailsSheet
        part={editingPart}
        onOpenChange={(open) => !open && setEditingPart(null)}
      />
    </div>
  );
}
