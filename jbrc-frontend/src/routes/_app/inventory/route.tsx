import Inventory from "@/features/inventory/pages/Inventory";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/inventory")({
  component: Inventory,
});
