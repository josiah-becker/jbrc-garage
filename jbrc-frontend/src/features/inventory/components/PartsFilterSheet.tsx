import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ListFilter } from "lucide-react";

export type PartsFilterGroup = {
  label: string;
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
};

function FilterGroup({ label, options, selected, onChange }: PartsFilterGroup) {
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

export default function PartsFilterSheet({
  groups,
}: {
  groups: PartsFilterGroup[];
}) {
  const activeFilterCount = groups.reduce(
    (count, group) => count + group.selected.length,
    0,
  );

  return (
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
          {groups.map((group) => (
            <FilterGroup key={group.label} {...group} />
          ))}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              onClick={() => {
                for (const group of groups) group.onChange([]);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
