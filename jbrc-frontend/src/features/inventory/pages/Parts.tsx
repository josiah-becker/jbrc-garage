import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ListFilter,
  Trash2Icon,
} from "lucide-react";
import { useMemo, useState } from "react";
import AddPartsDialog from "../components/AddPartsDialog";
import { GetAllPartsQuery } from "../queries/allPartsQuery";
import { deleteParts } from "../queries/deleteParts";
import type { Part } from "../schemas/GetAllParts";

const columns: ColumnDef<Part>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={
          table.getIsSomePageRowsSelected() &&
          !table.getIsAllPageRowsSelected()
        }
        onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
        aria-label="Select all rows"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "part_number",
    header: "Part Number",
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ getValue }) => getValue<string | null>() ?? "N/A",
    filterFn: (row, columnId, filterValue: string[]) =>
      filterValue.length === 0 || filterValue.includes(row.getValue(columnId)),
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "category",
    header: "Category",
    filterFn: (row, columnId, filterValue: string[]) =>
      filterValue.length === 0 || filterValue.includes(row.getValue(columnId)),
  },
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

  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ getValue }) => getValue<string | null>() ?? "N/A",
  },
];

function FilterGroup({
  label,
  options,
  selected,
  onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm font-medium text-foreground">{label}</h4>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const checked = selected.includes(option);
          return (
            <label
              key={option}
              className="flex items-center gap-2 text-sm text-muted-foreground"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={(isChecked) =>
                  onChange(
                    isChecked
                      ? [...selected, option]
                      : selected.filter((value) => value !== option),
                  )
                }
              />
              {option}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function Parts() {
  const { data: parts } = useSuspenseQuery(GetAllPartsQuery);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: deleteParts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GetAllPartsQuery.queryKey });
      setRowSelection({});
      setDeleteDialogOpen(false);
    },
  });

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

  const activeFilterCount =
    selectedCategories.length +
    selectedBrands.length +
    selectedVehicles.length;

  const selectedIds = Object.entries(rowSelection)
    .filter(([, selected]) => selected)
    .map(([id]) => id);

  const table = useReactTable({
    data: parts,
    columns,
    state: { sorting, columnFilters, rowSelection },
    getRowId: (part) => part.id,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          {selectedIds.length > 0 && (
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger
                render={
                  <Button variant="destructive">
                    <Trash2Icon />
                    Delete {selectedIds.length} selected
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    Delete {selectedIds.length} part
                    {selectedIds.length === 1 ? "" : "s"}?
                  </DialogTitle>
                  <DialogDescription>
                    This will permanently remove the selected part
                    {selectedIds.length === 1 ? "" : "s"} and any vehicle
                    associations. This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                {deleteMutation.isError && (
                  <p className="text-sm text-destructive">
                    Failed to delete parts. Please try again.
                  </p>
                )}
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    Cancel
                  </DialogClose>
                  <Button
                    variant="destructive"
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(selectedIds)}
                  >
                    {deleteMutation.isPending ? "Deleting..." : "Delete"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="flex gap-2">
          <AddPartsDialog />
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline">
                  <ListFilter />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary">{activeFilterCount}</Badge>
                  )}
                </Button>
              }
            />
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Parts</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6 px-4">
                <FilterGroup
                  label="Category"
                  options={categoryOptions}
                  selected={selectedCategories}
                  onChange={setSelectedCategories}
                />
                <FilterGroup
                  label="Brand"
                  options={brandOptions}
                  selected={selectedBrands}
                  onChange={setSelectedBrands}
                />
                <FilterGroup
                  label="Compatible Vehicles"
                  options={vehicleOptions}
                  selected={selectedVehicles}
                  onChange={setSelectedVehicles}
                />
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSelectedCategories([]);
                      setSelectedBrands([]);
                      setSelectedVehicles([]);
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const sortDirection = header.column.getIsSorted();
                return (
                  <TableHead key={header.id}>
                    {header.column.getCanSort() ? (
                      <button
                        type="button"
                        className="flex items-center gap-1 select-none"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {sortDirection === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : sortDirection === "desc" ? (
                          <ArrowDown className="size-3.5" />
                        ) : (
                          <ArrowUpDown className="size-3.5 text-muted-foreground" />
                        )}
                      </button>
                    ) : (
                      flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )
                    )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() ? "selected" : undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
