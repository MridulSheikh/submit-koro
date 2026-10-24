import AppSidebar from "@/components/layout/Sidebar/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import {
  AuthServiceUnavailableError,
  getServerDashboardUser,
  getServerAuthSession,
} from "@/lib/auth/server";
import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import DashboardLoading from "@/components/layout/DashboardLoading";

async function AuthenticatedDashboard({
  children,
}: {
  children: ReactNode;
}) {
  let session;
  let user;
  try {
    session = await getServerAuthSession();
    if (session?.user.emailVerified) user = await getServerDashboardUser();
  } catch (error) {
    if (!(error instanceof AuthServiceUnavailableError)) throw error;

    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f7fa] px-5 text-slate-900">
        <section
          className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm"
          role="alert"
        >
          <h1 className="text-xl font-semibold">Can’t connect to Submit Koro</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            We couldn’t verify your sign-in because the authentication service
            is unavailable. Make sure the API server is running, then reload
            this page.
          </p>
        </section>
      </main>
    );
  }

  if (!session?.user.emailVerified) redirect("/login");
  if (!user) redirect("/login");

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <main className="min-w-0 flex-1">
        <SidebarTrigger className="fixed left-3 top-3 z-20 bg-white shadow-sm md:hidden" />
        {children}
      </main>
    </SidebarProvider>
  );
}

const DashboardLayout = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <AuthenticatedDashboard>{children}</AuthenticatedDashboard>
    </Suspense>
  );
};

export default DashboardLayout;
