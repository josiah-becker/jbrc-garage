import Garage from "@/features/garage/pages/Garage";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Garage,
});
