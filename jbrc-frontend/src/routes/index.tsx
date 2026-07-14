import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div>
      hello
      <Button>click me</Button>
      <Badge>wowowow</Badge>
    </div>
  );
}
