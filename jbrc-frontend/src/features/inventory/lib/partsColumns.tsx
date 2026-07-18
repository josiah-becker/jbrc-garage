import { Checkbox } from "@/components/ui/checkbox";
import type { ColumnDef, FilterFn } from "@tanstack/react-table";
import type { Part } from "../schemas/GetAllParts";

export const selectColumn: ColumnDef<Part> = {
  id: "select",
  header: ({ table }) => (
    <Checkbox
      checked={table.getIsAllPageRowsSelected()}
      indeterminate={
        table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()
      }
      onCheckedChange={(checked) => table.toggleAllPageRowsSelected(checked)}
      aria-label="Select all rows"
    />
  ),
  cell: ({ row }) => (
    <div onClick={(e) => e.stopPropagation()}>
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(checked) => row.toggleSelected(checked)}
        aria-label="Select row"
      />
    </div>
  ),
  enableSorting: false,
  enableHiding: false,
};

export const partsSearchFilterFn: FilterFn<Part> = (
  row,
  _columnId,
  filterValue,
) => {
  const search = String(filterValue).toLowerCase();
  return (
    row.original.name.toLowerCase().includes(search) ||
    row.original.part_number.toLowerCase().includes(search)
  );
};

export const partNumberColumn: ColumnDef<Part> = {
  accessorKey: "part_number",
  header: "Part Number",
};

export const brandColumn: ColumnDef<Part> = {
  accessorKey: "brand",
  header: "Brand",
  cell: ({ getValue }) => getValue<string | null>() ?? "N/A",
  filterFn: (row, columnId, filterValue: string[]) =>
    filterValue.length === 0 || filterValue.includes(row.getValue(columnId)),
};

export const nameColumn: ColumnDef<Part> = {
  accessorKey: "name",
  header: "Name",
};

export const categoryColumn: ColumnDef<Part> = {
  accessorKey: "category",
  header: "Category",
  filterFn: (row, columnId, filterValue: string[]) =>
    filterValue.length === 0 || filterValue.includes(row.getValue(columnId)),
};

export const notesColumn: ColumnDef<Part> = {
  accessorKey: "notes",
  header: "Notes",
  cell: ({ getValue }) => getValue<string | null>() ?? "N/A",
};

export const quantityColumn: ColumnDef<Part> = {
  accessorKey: "quantity",
  header: "Quantity",
  cell: ({ getValue }) => {
    const quantity = getValue<Part["quantity"]>();
    if (!quantity) return <span className="text-muted-foreground">N/A</span>;
    return (
      <div className="flex flex-col">
        <span>{quantity.total} total</span>
        <span className="text-xs text-muted-foreground">
          {quantity.new} new &middot; {quantity.used} used
        </span>
      </div>
    );
  },
  sortingFn: (rowA, rowB) =>
    (rowA.original.quantity?.total ?? 0) - (rowB.original.quantity?.total ?? 0),
};
