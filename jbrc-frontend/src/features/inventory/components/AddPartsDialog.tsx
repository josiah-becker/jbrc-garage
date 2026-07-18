import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { GetAllVehiclesQuery } from "@/features/garage/queries/GetAllVehicles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, UploadIcon } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { parseCsv } from "../lib/parseCsv";
import { GetAllPartsQuery } from "../queries/allPartsQuery";
import { createParts, type NewPart } from "../queries/createPart";

const REQUIRED_CSV_COLUMNS = ["part_number", "name", "category"];

const emptyForm = {
  part_number: "",
  name: "",
  category: "",
  brand: "",
  notes: "",
};

export default function AddPartsDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"single" | "csv">("single");
  const [form, setForm] = useState(emptyForm);
  const [vehicleIds, setVehicleIds] = useState<string[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const { data: vehicles = [] } = useQuery(GetAllVehiclesQuery);

  const mutation = useMutation({
    mutationFn: createParts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GetAllPartsQuery.queryKey });
      setOpen(false);
      resetForm();
    },
  });

  function resetForm() {
    setForm(emptyForm);
    setVehicleIds([]);
    setCsvFile(null);
    setCsvError(null);
    setMode("single");
    mutation.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setCsvError(null);

    if (mode === "single") {
      mutation.mutate([
        {
          part_number: form.part_number,
          name: form.name,
          category: form.category,
          brand: form.brand || null,
          notes: form.notes || null,
          vehicle_ids: vehicleIds,
        },
      ]);
      return;
    }

    if (!csvFile) {
      setCsvError("Select a CSV file to upload.");
      return;
    }

    const rows = parseCsv(await csvFile.text());
    const missingColumns = REQUIRED_CSV_COLUMNS.filter(
      (column) => !(column in (rows[0] ?? {})),
    );
    if (rows.length === 0 || missingColumns.length > 0) {
      setCsvError(
        "CSV must include a header row with part_number, name, and category columns.",
      );
      return;
    }

    const parts: NewPart[] = rows.map((row) => ({
      part_number: row.part_number,
      name: row.name,
      category: row.category,
      brand: row.brand || null,
      notes: row.notes || null,
      vehicle_ids: vehicleIds,
    }));
    mutation.mutate(parts);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) resetForm();
      }}
    >
      <DialogTrigger
        render={
          <Button>
            <PlusIcon />
            Add Parts
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Parts</DialogTitle>
          <DialogDescription>
            Add a single part or upload a CSV, and optionally mark them as
            compatible with vehicles in your garage.
          </DialogDescription>
        </DialogHeader>
        <form
          id="add-parts-form"
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <Tabs
            value={mode}
            onValueChange={(value) => setMode(value as "single" | "csv")}
          >
            <TabsList className="w-full">
              <TabsTrigger value="single">Enter a part</TabsTrigger>
              <TabsTrigger value="csv">Upload CSV</TabsTrigger>
            </TabsList>
            <TabsContent value="single" className="flex flex-col gap-3 pt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="part_number">Part number</Label>
                <Input
                  id="part_number"
                  required
                  value={form.part_number}
                  onChange={(e) =>
                    setForm({ ...form, part_number: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  required
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(e) =>
                    setForm({ ...form, brand: e.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) =>
                    setForm({ ...form, notes: e.target.value })
                  }
                />
              </div>
            </TabsContent>
            <TabsContent value="csv" className="flex flex-col gap-3 pt-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="csv-file">CSV file</Label>
                <input
                  ref={fileInputRef}
                  id="csv-file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
                  className="text-sm file:mr-2 file:rounded-lg file:border-0 file:bg-muted file:px-2.5 file:py-1 file:text-sm file:font-medium file:text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Requires a header row with part_number, name, category, and
                  optionally brand and notes.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="vehicles">Compatible vehicles</Label>
            <Select
              multiple
              value={vehicleIds}
              onValueChange={(value) => setVehicleIds(value)}
            >
              <SelectTrigger id="vehicles" className="w-full">
                <SelectValue placeholder="None selected">
                  {(value: string[]) =>
                    value.length === 0
                      ? "None selected"
                      : vehicles
                          .filter((vehicle) => value.includes(vehicle.id))
                          .map((vehicle) => vehicle.name)
                          .join(", ")
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(csvError || mutation.isError) && (
            <p className="text-sm text-destructive">
              {csvError ?? "Failed to add parts. Please try again."}
            </p>
          )}
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            Cancel
          </DialogClose>
          <Button
            type="submit"
            form="add-parts-form"
            disabled={mutation.isPending}
          >
            {mode === "csv" && <UploadIcon />}
            {mutation.isPending ? "Adding..." : "Add Parts"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
