import { Input } from "@/components/ui/input";
import { Autocomplete } from "@base-ui/react/autocomplete";
import type { Part } from "../schemas/GetAllParts";

function matchesPart(part: Part, query: string) {
  const search = query.toLowerCase();
  return (
    part.name.toLowerCase().includes(search) ||
    part.part_number.toLowerCase().includes(search)
  );
}

export default function PartsSearchInput({
  parts,
  value,
  onValueChange,
}: {
  parts: Part[];
  value: string;
  onValueChange: (value: string) => void;
}) {
  return (
    <Autocomplete.Root
      items={parts}
      value={value}
      onValueChange={onValueChange}
      itemToStringValue={(part: Part) => part.name}
      filter={matchesPart}
    >
      <Autocomplete.Input
        render={
          <Input
            placeholder="Search name or part number"
            className="w-64"
            aria-label="Search parts"
          />
        }
      />
      <Autocomplete.Portal>
        <Autocomplete.Positioner sideOffset={4} className="isolate z-50">
          <Autocomplete.Popup className="max-h-[min(20rem,var(--available-height))] w-(--anchor-width) overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Autocomplete.Empty className="px-1.5 py-1 text-sm text-muted-foreground">
              No matching parts.
            </Autocomplete.Empty>
            <Autocomplete.List>
              {(part: Part) => (
                <Autocomplete.Item
                  key={part.id}
                  value={part}
                  className="flex cursor-default items-center gap-2 rounded-md px-1.5 py-1 text-sm outline-hidden select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground"
                >
                  <span className="flex-1 truncate">{part.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {part.part_number}
                  </span>
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
}
