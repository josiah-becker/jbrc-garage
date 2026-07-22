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
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { GetAllVehiclesQuery } from "@/features/garage/queries/GetAllVehicles";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon, UploadIcon } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";
import { parseCsv } from "../lib/parseCsv";
import {
  DIFFERENTIAL_CATEGORY,
  emptyOilForm,
  OIL_CATEGORY,
  resolveOilPartId,
  type OilForm,
} from "../lib/differentials";
import { DefaultPartsCategory } from "../lib/partsCategories";
import { GetAllPartsQuery } from "../queries/allPartsQuery";
import { createParts, type NewPart } from "../queries/createPart";
import DifferentialDetailsFields from "./DifferentialDetailsFields";

const REQUIRED_CSV_COLUMNS = ["part_number", "name", "category"];

// Sentinel dropdown value that swaps the category select to a free-text input.
const CUSTOM_CATEGORY = "__custom__";

const emptyForm = {
  part_number: "",
  name: "",
  category: "",
  custom_category: "",
  brand: "",
  notes: "",
  consumable: false,
};

export default function AddPartsDialog({
  defaultVehicleId,
}: {
  defaultVehicleId?: string;
}) {
  const defaultVehicleIds = defaultVehicleId ? [defaultVehicleId] : [];
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"single" | "csv">("single");
  const [form, setForm] = useState(emptyForm);
  const [vehicleIds, setVehicleIds] = useState<string[]>(defaultVehicleIds);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();
  const { data: vehicles = [] } = useQuery({
    ...GetAllVehiclesQuery,
    enabled: !defaultVehicleId,
  });
  const { data: parts = [] } = useQuery(GetAllPartsQuery);

  const resolvedCategory =
    form.category === CUSTOM_CATEGORY
      ? form.custom_category.trim()
      : form.category;
  const isDifferential = resolvedCategory === DIFFERENTIAL_CATEGORY;
  const oilOptions = parts.filter((part) => part.category === OIL_CATEGORY);
  const defaultOilMode = oilOptions.length > 0 ? "existing" : "new";

  const [sealed, setSealed] = useState(false);
  const [oilMode, setOilMode] = useState<"existing" | "new">(defaultOilMode);
  const [selectedOilId, setSelectedOilId] = useState<string | null>(null);
  const [oilForm, setOilForm] = useState<OilForm>(emptyOilForm);

  const customCategories = Array.from(
    new Set(parts.map((part) => part.category)),
  )
    .filter(
      (category) =>
        !(DefaultPartsCategory as readonly string[]).includes(category),
    )
    .sort();
  const categories = [...DefaultPartsCategory, ...customCategories];

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
    setVehicleIds(defaultVehicleIds);
    setCsvFile(null);
    setCsvError(null);
    setMode("single");
    setSealed(false);
    setOilMode(defaultOilMode);
    setSelectedOilId(null);
    setOilForm(emptyOilForm);
    mutation.reset();
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setCsvError(null);

    if (mode === "single") {
      const details = isDifferential
        ? {
            sealed,
            oil_part_id: await resolveOilPartId(oilMode, selectedOilId, oilForm),
          }
        : undefined;

      mutation.mutate([
        {
          part_number: form.part_number,
          name: form.name,
          category: resolvedCategory,
          brand: form.brand || null,
          notes: form.notes || null,
          consumable: form.consumable,
          vehicle_ids: vehicleIds,
          ...(details ? { details } : {}),
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
          <Button
            className="fixed bottom-4 right-4 z-50 md:static md:bottom-auto md:right-auto"
            variant="default"
          >
            <PlusIcon />
            Add Parts
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Parts</DialogTitle>
          <DialogDescription>
            {defaultVehicleId
              ? "Add a single part or upload a CSV. New parts are marked as compatible with this vehicle."
              : "Add a single part or upload a CSV, and optionally mark them as compatible with vehicles in your garage."}
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
                <Select
                  required
                  value={form.category || null}
                  onValueChange={(value) =>
                    setForm({ ...form, category: value ?? "" })
                  }
                >
                  <SelectTrigger id="category" className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectSeparator />
                    <SelectItem value={CUSTOM_CATEGORY}>Custom…</SelectItem>
                  </SelectContent>
                </Select>
                {form.category === CUSTOM_CATEGORY && (
                  <Input
                    id="custom-category"
                    required
                    autoFocus
                    placeholder="Enter a category"
                    aria-label="Custom category"
                    value={form.custom_category}
                    onChange={(e) =>
                      setForm({ ...form, custom_category: e.target.value })
                    }
                  />
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <Label htmlFor="consumable">Consumable</Label>
                  <p className="text-xs text-muted-foreground">
                    Gets used up over time and can't be installed on a vehicle.
                  </p>
                </div>
                <Switch
                  id="consumable"
                  checked={form.consumable}
                  onCheckedChange={(checked) =>
                    setForm({ ...form, consumable: checked })
                  }
                />
              </div>
              {isDifferential && (
                <DifferentialDetailsFields
                  idPrefix="add-parts-diff"
                  parts={parts}
                  sealed={sealed}
                  onSealedChange={setSealed}
                  oilMode={oilMode}
                  onOilModeChange={setOilMode}
                  selectedOilId={selectedOilId}
                  onSelectedOilIdChange={setSelectedOilId}
                  oilForm={oilForm}
                  onOilFormChange={setOilForm}
                />
              )}
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

          {!defaultVehicleId && (
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
          )}

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
