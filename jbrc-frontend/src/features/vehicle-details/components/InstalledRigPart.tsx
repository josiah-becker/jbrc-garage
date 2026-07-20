import { Button } from "@/components/ui/button";
import { GetAllPartsQuery } from "@/features/inventory/queries/allPartsQuery";
import type { Part } from "@/features/inventory/schemas/GetAllParts";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { XIcon } from "lucide-react";
import { installPart } from "../queries/installPart";

// An installed part with a remove button that uninstalls it (the part
// stays in inventory as a spare).
export default function InstalledRigPart({ part }: { part: Part }) {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => installPart(part.id, null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GetAllPartsQuery.queryKey });
    },
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <p>{part.name}</p>
          <p className="text-sm text-muted-foreground">{part.part_number}</p>
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={`Remove ${part.name}`}
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          <XIcon />
        </Button>
      </div>
      {mutation.isError && (
        <p className="text-sm text-destructive">
          Failed to remove part. Please try again.
        </p>
      )}
    </div>
  );
}
