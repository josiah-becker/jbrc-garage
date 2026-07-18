import type { ColumnDef } from "@tanstack/react-table";
import type { Part } from "../schemas/GetAllParts";

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
