import Sessions from "@/features/sessions/pages/Sessions";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/sessions/")({
  component: Sessions,
});
