"use client";

import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock3,
  FileText,
  Search,
  Star,
  XCircle,
} from "lucide-react";
import { useState } from "react";

const queue = [
  {
    title: "E-commerce dashboard",
    student: "Nusrat Jahan",
    initials: "NJ",
    submitted: "Today at 10:42 AM",
    track: "Frontend Development",
    status: "Pending",
    description:
      "A responsive storefront dashboard with product summaries, category navigation, and a shopping cart flow.",
    avatar: "bg-blue-100 text-blue-700",
  },
  {
    title: "Weather app with API",
    student: "Rafi Ahmed",
    initials: "RA",
    submitted: "Today at 9:18 AM",
    track: "Web Fundamentals",
    status: "Pending",
    description:
      "A city weather experience that presents current conditions and a short forecast from a public weather API.",
    avatar: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Personal portfolio",
    student: "Sadia Islam",
    initials: "SI",
    submitted: "Yesterday at 4:36 PM",
    track: "Frontend Development",
    status: "Pending",
    description:
      "A personal portfolio showcasing selected projects, an introduction, and contact information.",
    avatar: "bg-sky-100 text-sky-700",
  },
  {
    title: "Task planner",
    student: "Imran Hossain",
    initials: "IH",
    submitted: "Yesterday at 1:12 PM",
    track: "JavaScript Basics",
    status: "Approved",
    description:
      "A small task planner for adding, completing, and organizing daily tasks.",
    avatar: "bg-amber-100 text-amber-700",
  },
];

const statusStyles: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Rejected: "bg-rose-50 text-rose-700 ring-rose-200",
};

type StatusFilter = "All" | "Pending" | "Approved" | "Rejected";

export default function ReviewPage() {
  const [submissions, setSubmissions] = useState(queue);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const visibleSubmissions = statusFilter === "All"
    ? submissions
    : submissions.filter((item) => item.status === statusFilter);
  const pendingCount = submissions.filter((item) => item.status === "Pending").length;
  const approvedCount = submissions.filter((item) => item.status === "Approved").length;
  const rejectedCount = submissions.filter((item) => item.status === "Rejected").length;

  function decideSubmission(title: string, decision: "Pending" | "Approved" | "Rejected") {
    setSubmissions((current) =>
      current.map((item) => item.title === title ? { ...item, status: decision } : item),
    );
  }

  return (
    <div className="min-h-screen flex-1 bg-[#f7f8fc] text-slate-900">

      {/* header section */}
      <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Workspace</span>
          <span className="text-slate-300">/</span>
          <span className="font-semibold text-slate-800">Review submissions</span>
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-400 sm:flex">
          <Search className="size-4" />
          <span>Submission queue</span>
        </div>
      </header>

     {/* main section */}
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-700">Mentor workspace</p>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Review submissions</h1>
              <p className="mt-2 text-sm text-slate-500">Check student work and help them take the next step.</p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 shadow-sm">
              <FileText className="size-4 text-blue-700" /> All submissions <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{queue.length}</span>
            </div>
          </div>
        </div>


        <section aria-label="Review summary" className="mb-6 grid gap-4 sm:grid-cols-3">
          <SummaryCard label="Pending" count={String(pendingCount)} icon={Clock3} color="amber" />
          <SummaryCard label="Approved" count={String(approvedCount)} icon={CheckCircle2} color="green" />
          <SummaryCard label="Rejected" count={String(rejectedCount)} icon={XCircle} color="blue" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="font-semibold">Submission queue</h2>
              <p className="mt-1 text-sm text-slate-500">Recently submitted student projects</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div role="group" aria-label="Filter submissions by status" className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                {(["All", "Pending", "Approved", "Rejected"] as const).map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    aria-pressed={statusFilter === filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`rounded-md px-2.5 py-1.5 text-xs font-medium transition sm:px-3 ${statusFilter === filter ? "bg-white text-blue-700 shadow-sm ring-1 ring-slate-200" : "text-slate-500 hover:text-slate-800"}`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <span className="hidden items-center gap-1.5 text-xs font-medium text-slate-500 lg:inline-flex"><span className="size-2 rounded-full bg-emerald-500" /> Up to date</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {visibleSubmissions.length > 0 ? visibleSubmissions.map((item) => (
              <article key={item.title} className="px-5 py-5 sm:px-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.avatar}`}>{item.initials}</span>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">{item.title}</h3>
                      <p className="mt-1 text-sm text-slate-600">{item.student}</p>
                      <p className="mt-1 text-xs text-slate-400">{item.track} <span className="px-1">·</span> {item.submitted}</p>
                    </div>
                  </div>
                  <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[item.status]}`}>
                    {item.status === "Rejected" ? <XCircle className="size-3.5" /> : item.status === "Approved" ? <CheckCircle2 className="size-3.5" /> : <Clock3 className="size-3.5" />}
                    {item.status}
                  </span>
                </div>
                <div className="mt-4 ml-[52px] flex flex-wrap items-center gap-3">
                  <label className="relative inline-flex items-center">
                    <span className="sr-only">Choose approval action for {item.title}</span>
                    <select
                      value={item.status}
                      onChange={(event) => {
                        if (["Pending", "Approved", "Rejected"].includes(event.target.value)) {
                          decideSubmission(item.title, event.target.value as "Pending" | "Approved" | "Rejected");
                        }
                      }}
                      className="h-9 min-w-44 appearance-none rounded-lg border border-slate-200 bg-white py-2 pl-3 pr-9 text-xs font-semibold text-slate-700 shadow-sm outline-none transition hover:border-blue-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 size-4 text-slate-400" />
                  </label>
                  {(item.status === "Approved" || item.status === "Rejected") && (
                    <span className={`text-xs font-medium ${item.status === "Approved" ? "text-emerald-700" : "text-rose-700"}`}>
                      {item.status === "Approved" ? "Student submission approved" : "Student submission rejected"}
                    </span>
                  )}
                </div>
                <details className="group mt-4 ml-[52px]">
                  <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-semibold text-blue-700 outline-none hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-600 [&::-webkit-details-marker]:hidden">
                    View project summary <ArrowUpRight className="size-3.5 transition-transform group-open:rotate-45" />
                  </summary>
                  <p className="mt-3 max-w-3xl rounded-lg bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600">{item.description}</p>
                </details>
              </article>
            )) : (
              <div className="px-6 py-12 text-center">
                <p className="text-sm font-medium text-slate-700">No {statusFilter.toLowerCase()} submissions</p>
                <p className="mt-1 text-sm text-slate-500">Choose another status to see more submissions.</p>
              </div>
            )}
          </div>
        </section>

        <p className="mt-4 flex items-center gap-2 text-xs text-slate-400"><Star className="size-3.5 text-emerald-600" /> Clear, specific feedback helps students keep making progress.</p>
      </main>
    </div>
  );
}

function SummaryCard({
  label,
  count,
  icon: Icon,
  color,
}: {
  label: string;
  count: string;
  icon: typeof Clock3;
  color: "amber" | "blue" | "green";
}) {
  const iconStyle = {
    amber: "bg-amber-50 text-amber-600",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
  }[color];

  return (
    <article className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
      <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight">{count}</p></div>
      <span className={`flex size-10 items-center justify-center rounded-xl ${iconStyle}`}><Icon className="size-5" /></span>
    </article>
  );
}
