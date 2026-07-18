import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="p-4 border-b border-border">
          <SidebarTrigger />
        </header>
        <div className="p-4 size-full">
          <Suspense
            fallback={
              <Loader2Icon className="animate-spin size-24 stroke-[0.5]" />
            }
          >
            <Outlet />
          </Suspense>
        </div>
      </SidebarInset>
      <TanStackRouterDevtools />
    </SidebarProvider>
  );
}
