import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { supabase } from "@/lib/supabase";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) throw redirect({ to: "/login" });
  },
  component: AppLayout,
});

function AppLayout() {
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
    </SidebarProvider>
  );
}
