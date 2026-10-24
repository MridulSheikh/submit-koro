import { ArrowRight, CheckCircle2, Clock3, FileText, UsersRound } from "lucide-react";
import Link from "next/link";
import { requireDashboardUser } from "@/lib/auth/server";
import { getApiError, serverApiFetch } from "@/lib/server-api";

type Overview = {
  totalSubmission: number;
  pendingReview: number;
  totalApproved: number;
  latestSubmissions: {
    id: string;
    projectName: string;
    status: string;
    createdAt: string;
    user?: { id: string; name: string };
  }[];
};

export default async function OverviewPage() {
  const user = await requireDashboardUser("overview", "VIEW");
  const response = await serverApiFetch("/overview");
  const result = await response.json().catch(() => null);
  const data = response.ok ? (result?.data as Overview | undefined) : undefined;

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-5 py-8 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-700">{user.role?.name ?? "Workspace"}</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Overview</h1>
          <p className="mt-2 text-sm text-slate-500">A live summary of submissions and review activity.</p>
        </header>
        {!response.ok ? (
          <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
            {getApiError(result, "Unable to load the overview.")}
          </div>
        ) : !data ? (
          <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">The API returned invalid overview data.</div>
        ) : (
          <>
            <section className="grid gap-4 sm:grid-cols-3" aria-label="Submission statistics">
              <Metric label="Total submissions" value={data.totalSubmission} icon={FileText} tone="blue" />
              <Metric label="Pending review" value={data.pendingReview} icon={Clock3} tone="amber" />
              <Metric label="Approved" value={data.totalApproved} icon={CheckCircle2} tone="emerald" />
            </section>
            <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
                <div><h2 className="font-semibold">Latest submissions</h2><p className="mt-1 text-sm text-slate-500">Most recently submitted projects</p></div>
                {user.role?.reviewPermission.includes("REVIEW") && user.role.submissionPermission.some((item) => item === "VIEW" || item === "SUBMIT") && <Link href="/review" className="inline-flex items-center gap-1 text-sm font-semibold text-blue-700">Review submissions <ArrowRight className="size-4" /></Link>}
              </div>
              {data.latestSubmissions.length ? (
                <div className="divide-y divide-slate-100">
                  {data.latestSubmissions.map((item) => (
                    <article key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3"><span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700"><FileText className="size-5" /></span><div><h3 className="text-sm font-semibold">{item.projectName}</h3><p className="mt-1 text-xs text-slate-500">{item.user?.name ?? "Submitter"} · {new Date(item.createdAt).toLocaleDateString()}</p></div></div>
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{item.status.replaceAll("_", " ")}</span>
                    </article>
                  ))}
                </div>
              ) : <p className="px-6 py-10 text-center text-sm text-slate-500">No submissions yet.</p>}
            </section>
            <p className="mt-5 flex items-center gap-2 text-xs text-slate-400"><UsersRound className="size-4" /> Data is loaded from your Submit Koro workspace.</p>
          </>
        )}
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: number;
  icon: typeof FileText;
  tone: "blue" | "amber" | "emerald";
}) {
  const formattedValue = new Intl.NumberFormat("en-US").format(value);
  const toneClasses = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100",
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  }[tone];

  return (
    <article
      aria-label={`${label}: ${formattedValue}`}
      className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6"
    >
      <div className="flex items-start justify-between gap-4">
        <p className="pt-1 text-sm font-medium text-slate-500">{label}</p>
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset ${toneClasses}`}>
          <Icon aria-hidden="true" className="size-5" />
        </span>
      </div>
      <data
        value={value}
        className="mt-4 block text-3xl font-bold leading-none tracking-tight tabular-nums text-slate-950 sm:text-4xl"
      >
        {formattedValue}
      </data>
    </article>
  );
}
