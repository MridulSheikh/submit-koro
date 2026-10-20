import AppSidebar from "@/components/layout/Sidebar/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React, { ReactNode } from "react";

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  // Replace this build-time default with the authenticated user's role when auth is added.
  const role = process.env.NEXT_PUBLIC_USER_ROLE === "STUDENT" ? "STUDENT" : "MENTOR";

  return (
    <SidebarProvider>
      <AppSidebar role={role} />
      <main className="min-w-0 flex-1">
        <SidebarTrigger className="fixed left-3 top-3 z-20 bg-white shadow-sm md:hidden" />
        {children}
      </main>
    </SidebarProvider>
  );
};

export default DashboardLayout;
