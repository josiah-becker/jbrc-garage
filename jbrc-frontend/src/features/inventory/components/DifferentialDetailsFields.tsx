import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Part } from "@/features/inventory/schemas/GetAllParts";
import { NONE_OIL_VALUE, OIL_CATEGORY, type OilForm } from "../lib/differentials";

// Shared "sealed + which oil" fields for a differential's details, used both
// when tuning an installed diff and when creating a new one.
export default function DifferentialDetailsFields({
  idPrefix,
  parts,
  sealed,
  onSealedChange,
  oilMode,
  onOilModeChange,
  selectedOilId,
  onSelectedOilIdChange,
  oilForm,
  onOilFormChange,
}: {
  idPrefix: string;
  parts: Part[];
  sealed: boolean;
  onSealedChange: (sealed: boolean) => void;
  oilMode: "existing" | "new";
  onOilModeChange: (mode: "existing" | "new") => void;
  selectedOilId: string | null;
  onSelectedOilIdChange: (id: string | null) => void;
  oilForm: OilForm;
  onOilFormChange: (form: OilForm) => void;
}) {
  const oilOptions = parts.filter((p) => p.category === OIL_CATEGORY);

  return (
    <div className="flex flex-col gap-4">
      <Tabs
        value={oilMode}
        onValueChange={(value) => onOilModeChange(value as "existing" | "new")}
      >
        <TabsList className="w-full">
          <TabsTrigger value="existing">Choose existing oil</TabsTrigger>
          <TabsTrigger value="new">Create new oil</TabsTrigger>
        </TabsList>
        <TabsContent value="existing" className="flex flex-col gap-3 pt-2">
          {oilOptions.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`${idPrefix}-oil`}>Oil</Label>
              <Select
                value={selectedOilId ?? NONE_OIL_VALUE}
                onValueChange={(value) =>
                  onSelectedOilIdChange(value === NONE_OIL_VALUE ? null : value)
                }
              >
                <SelectTrigger id={`${idPrefix}-oil`} className="w-full">
                  <SelectValue placeholder="Select an oil">
                    {(value: string) =>
                      value === NONE_OIL_VALUE
                        ? "No oil selected"
                        : (oilOptions.find((oil) => oil.id === value)?.name ??
                          "Select an oil")
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_OIL_VALUE}>No oil selected</SelectItem>
                  {oilOptions.map((oil) => (
                    <SelectItem key={oil.id} value={oil.id}>
                      {oil.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No {OIL_CATEGORY} parts in your inventory. Create a new one
              instead.
            </p>
          )}
        </TabsContent>
        <TabsContent value="new" className="flex flex-col gap-3 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-oil-part-number`}>Part number</Label>
            <Input
              id={`${idPrefix}-oil-part-number`}
              required
              value={oilForm.part_number}
              onChange={(e) =>
                onOilFormChange({ ...oilForm, part_number: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-oil-name`}>Name</Label>
            <Input
              id={`${idPrefix}-oil-name`}
              required
              placeholder="e.g. 5000cst Silicone"
              value={oilForm.name}
              onChange={(e) =>
                onOilFormChange({ ...oilForm, name: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-oil-brand`}>Brand</Label>
            <Input
              id={`${idPrefix}-oil-brand`}
              value={oilForm.brand}
              onChange={(e) =>
                onOilFormChange({ ...oilForm, brand: e.target.value })
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={`${idPrefix}-oil-notes`}>Notes</Label>
            <Textarea
              id={`${idPrefix}-oil-notes`}
              value={oilForm.notes}
              onChange={(e) =>
                onOilFormChange({ ...oilForm, notes: e.target.value })
              }
            />
          </div>
        </TabsContent>
      </Tabs>
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor={`${idPrefix}-sealed`}>Sealed</Label>
        <Switch
          id={`${idPrefix}-sealed`}
          checked={sealed}
          onCheckedChange={onSealedChange}
        />
      </div>
    </div>
  );
}
