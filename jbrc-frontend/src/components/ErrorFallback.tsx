import { Button } from "@/components/ui/button";
import type { ErrorComponentProps } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";

export function ErrorFallback({ error, reset }: ErrorComponentProps) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
      <TriangleAlert className="size-10 text-destructive" />
      <p className="font-medium">Something went wrong</p>
      <p className="text-sm text-muted-foreground max-w-md">{message}</p>
      <Button onClick={reset} variant="outline">
        Try again
      </Button>
    </div>
  );
}
