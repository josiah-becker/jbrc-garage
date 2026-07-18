import DataTable from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import AddPartsDialog from "../components/AddPartsDialog";
import DeletePartsDialog from "../components/DeletePartsDialog";
import PartsFilterSheet from "../components/PartsFilterSheet";
import PartsSearchInput from "../components/PartsSearchInput";
import {
  brandColumn,
  categoryColumn,
  nameColumn,
  notesColumn,
  partNumberColumn,
  partsSearchFilterFn,
  selectColumn,
} from "../lib/partsColumns";
import { GetAllPartsQuery } from "../queries/allPartsQuery";
import type { Part } from "../schemas/GetAllParts";

const columns: ColumnDef<Part>[] = [
  selectColumn,
  partNumberColumn,
  brandColumn,
  nameColumn,
  categoryColumn,
  {
    accessorKey: "vehicles",
    header: "Compatible Vehicles",
    cell: ({ getValue }) => {
      const vehicles = getValue<Part["vehicles"]>();
      if (vehicles.length === 0) {
        return <span className="text-muted-foreground">N/A</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {vehicles.map((vehicle) => (
            <Badge key={vehicle.id} variant="secondary">
              {vehicle.name}
            </Badge>
          ))}
        </div>
      );
    },
    filterFn: (row, columnId, filterValue: string[]) =>
      filterValue.length === 0 ||
      row
        .getValue<Part["vehicles"]>(columnId)
        .some((vehicle) => filterValue.includes(vehicle.name)),
  },
  notesColumn,
];

export default function Parts() {
  "use no memo";
  const { data: parts } = useSuspenseQuery(GetAllPartsQuery);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const categoryOptions = useMemo(
    () => Array.from(new Set(parts.map((part) => part.category))).sort(),
    [parts],
  );
  const brandOptions = useMemo(
    () =>
      Array.from(
        new Set(
          parts
            .map((part) => part.brand)
            .filter((brand): brand is string => !!brand),
        ),
      ).sort(),
    [parts],
  );
  const vehicleOptions = useMemo(
    () =>
      Array.from(
        new Set(parts.flatMap((part) => part.vehicles.map((v) => v.name))),
      ).sort(),
    [parts],
  );

  const columnFilters: ColumnFiltersState = useMemo(
    () => [
      { id: "category", value: selectedCategories },
      { id: "brand", value: selectedBrands },
      { id: "vehicles", value: selectedVehicles },
    ],
    [selectedCategories, selectedBrands, selectedVehicles],
  );

  const selectedIds = Object.entries(rowSelection)
    .filter(([, selected]) => selected)
    .map(([id]) => id);

  const table = useReactTable({
    data: parts,
    columns,
    state: { sorting, columnFilters, rowSelection, globalFilter },
    getRowId: (part) => part.id,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: partsSearchFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PartsSearchInput
            parts={parts}
            value={globalFilter}
            onValueChange={setGlobalFilter}
          />
          {selectedIds.length > 0 && (
            <DeletePartsDialog
              selectedIds={selectedIds}
              onDeleted={() => setRowSelection({})}
            />
          )}
        </div>
        <div className="flex gap-2">
          <AddPartsDialog />
          <PartsFilterSheet
            groups={[
              {
                label: "Category",
                options: categoryOptions,
                selected: selectedCategories,
                onChange: setSelectedCategories,
              },
              {
                label: "Brand",
                options: brandOptions,
                selected: selectedBrands,
                onChange: setSelectedBrands,
              },
              {
                label: "Compatible Vehicles",
                options: vehicleOptions,
                selected: selectedVehicles,
                onChange: setSelectedVehicles,
              },
            ]}
          />
        </div>
      </div>
      <DataTable table={table} />
    </div>
  );
}
