import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Clock3,
  FileCheck2,
  FileText,
  Plus,
  Search,
  Star,
} from "lucide-react";
import Link from "next/link";

const stats = [
  { label: "Total submissions", value: "128", delta: "+12%", icon: FileText, tone: "blue" },
  { label: "Awaiting review", value: "18", delta: "Needs attention", icon: Clock3, tone: "amber" },
  { label: "Reviewed this month", value: "42", delta: "+8 this week", icon: FileCheck2, tone: "green" },
];

const submissions = [
  { title: "E-commerce dashboard", name: "Nusrat Jahan", initials: "NJ", date: "Today, 10:42 AM", status: "Needs review", color: "bg-blue-100 text-blue-700" },
  { title: "Weather app with API", name: "Rafi Ahmed", initials: "RA", date: "Today, 9:18 AM", status: "In review", color: "bg-sky-100 text-sky-700" },
  { title: "Personal portfolio", name: "Sadia Islam", initials: "SI", date: "Yesterday", status: "Reviewed", color: "bg-emerald-100 text-emerald-700" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex-1 bg-[#f7f8fc] text-slate-900">
      <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-white/70 bg-white/90 px-5 shadow-[0_4px_24px_rgba(15,23,42,0.035)] backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-3">
          <div className="hidden h-10 w-56 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-slate-400 sm:flex">
            <Search className="size-4" />
            <span className="flex-1 text-sm">Search workspace</span>
            <kbd className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-400">⌘ K</kbd>
          </div>
          <div className="flex items-center gap-2 sm:ml-2">
            <span className="text-xs font-medium text-slate-400">Workspace</span>
            <span className="text-slate-300">/</span>
            <span className="text-sm font-semibold text-slate-800">Overview</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 md:inline-flex">Mentor</span>
          <button aria-label="Notifications" className="relative flex size-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-800">
            <Bell className="size-[18px]" />
            <span className="absolute right-2.5 top-2 size-2 rounded-full border-2 border-white bg-rose-500" />
          </button>
          <span className="hidden h-8 w-px bg-slate-200 sm:block" />
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-700 to-emerald-600 text-xs font-bold text-white ring-2 ring-blue-100">MK</div>
            <div className="hidden lg:block"><p className="text-xs font-semibold leading-4 text-slate-800">Mentor Koro</p><p className="text-[11px] text-slate-400">Workspace admin</p></div>
          </div>
          <Link href="/review" className="inline-flex h-10 items-center gap-2 rounded-xl bg-blue-700 px-3 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-800 sm:px-4">
            <Plus className="size-4" /><span className="hidden sm:inline">Review queue</span><span className="sm:hidden">Review</span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-700">Your workspace</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Good morning 👋</h1>
            <p className="mt-2 text-sm text-slate-500">Here’s what’s happening with your submissions today.</p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">MK</div>
            <div><p className="text-sm font-semibold">Mentor workspace</p><p className="text-xs text-slate-500">Submission overview</p></div>
          </div>
        </section>

        <section aria-label="Submission statistics" className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map(({ label, value, delta, icon: Icon, tone }) => (
            <article key={label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.025)] sm:p-6">
              <div className="mb-5 flex items-start justify-between">
                <span className="text-sm font-medium text-slate-500">{label}</span>
                <span className={`flex size-10 items-center justify-center rounded-xl ${tone === "blue" ? "bg-blue-50 text-blue-700" : tone === "amber" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"}`}><Icon className="size-5" /></span>
              </div>
              <div className="flex items-end justify-between gap-2">
                <span className="text-3xl font-bold tracking-tight">{value}</span>
                <span className={`inline-flex items-center gap-1 pb-1 text-xs font-semibold ${tone === "amber" ? "text-amber-600" : "text-emerald-600"}`}>
                  {tone === "amber" ? <ArrowDownRight className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}{delta}
                </span>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
              <div><h2 className="font-semibold">Recent submissions</h2><p className="mt-1 text-sm text-slate-500">Latest work from your students</p></div>
              <Link href="/review" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700 hover:text-blue-800">View all <ArrowRight className="size-4" /></Link>
            </div>
            <div className="divide-y divide-slate-100">
              {submissions.map((item) => (
                <div key={item.title} className="flex flex-col gap-3 px-5 py-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${item.color}`}>{item.initials}</span>
                    <div className="min-w-0"><p className="truncate text-sm font-semibold">{item.title}</p><p className="mt-1 text-xs text-slate-500">{item.name} <span className="px-1">·</span> {item.date}</p></div>
                  </div>
                  <span className={`ml-[52px] inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium sm:ml-0 ${item.status === "Needs review" ? "bg-amber-50 text-amber-700" : item.status === "In review" ? "bg-sky-50 text-sky-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {item.status === "Reviewed" ? <CheckCircle2 className="size-3.5" /> : <Clock3 className="size-3.5" />}{item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-5">
            <div className="rounded-2xl bg-gradient-to-br from-blue-700 via-blue-700 to-emerald-700 p-6 text-white shadow-lg shadow-blue-200/60">
              <div className="mb-5 flex size-10 items-center justify-center rounded-xl bg-white/15"><Star className="size-5" /></div>
              <p className="text-sm font-medium text-blue-100">Your review activity</p>
              <p className="mt-2 text-3xl font-bold">42 <span className="text-base font-medium text-blue-100">reviews</span></p>
              <p className="mt-2 text-sm text-blue-100">You’re keeping students moving forward.</p>
              <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="h-full w-2/3 rounded-full bg-white" /></div>
              <p className="mt-2 text-xs text-blue-100">Monthly goal <span className="float-right">42 / 60</span></p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
              <h2 className="font-semibold">Quick tip</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Helpful, specific feedback gives students a clear next step. Highlight what works, then suggest one thing to improve.</p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}
