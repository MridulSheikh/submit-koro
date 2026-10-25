"use client";

import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading({
  contentOnly = false,
}: {
  contentOnly?: boolean;
}) {
  const pathname = usePathname();
  const titles: Record<string, string> = {
    "/": "Overview",
    "/mentors": "Manage team",
    "/review": "Review submissions",
    "/submission": "My submissions",
    "/profile": "Manage profile",
  };
  const title = titles[pathname] ?? "Your workspace";

  return (
    <div
      className={`min-h-screen bg-[#f7f8fc] ${contentOnly ? "" : "flex"}`}
      role="status"
      aria-label="Loading dashboard"
    >
      {!contentOnly && (
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-5 md:block">
          <Skeleton className="mb-8 h-10 w-40" />
          <div className="space-y-3">
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
          <Skeleton className="mt-10 h-16 w-full" />
        </aside>
      )}
      <main className={`min-w-0 flex-1 ${contentOnly ? "p-0" : "p-5 sm:p-8"}`}>
        <div className="mx-auto max-w-7xl">
          <Skeleton className="mb-3 h-4 w-32" />
          <h1 className="sr-only">{title}</h1>
          <Skeleton className="h-9 w-64 max-w-full" />
          <Skeleton className="mt-3 h-4 w-80 max-w-full" />
          {pathname === "/" ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-28 rounded-2xl" />
              ))}
            </div>
          ) : (
            <Skeleton className="mt-8 h-24 w-full rounded-2xl" />
          )}
          <Skeleton className="mt-6 h-14 w-full rounded-xl" />
          <div className="mt-4 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white px-5">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center gap-4 py-5">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48 max-w-full" />
                  <Skeleton className="h-3 w-72 max-w-full" />
                </div>
                <Skeleton className="h-9 w-32" />
              </div>
            ))}
          </div>
        </div>
      </main>
      <span className="sr-only">Loading your dashboard…</span>
    </div>
  );
}
