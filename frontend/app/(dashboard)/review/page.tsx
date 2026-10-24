import { Search } from "lucide-react";
import { redirect } from "next/navigation";
import ReviewQueueItem from "@/components/review/ReviewQueueItem";
import PagePagination from "@/components/shared/PagePagination";
import type { ReviewSubmission, ReviewSubmissionStatus } from "@/components/review/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { requireDashboardUser } from "@/lib/auth/server";
import { getApiError, serverApiFetch } from "@/lib/server-api";

const statuses: ReviewSubmissionStatus[] = ["PENDING", "IN_REVIEW", "REVIEWED", "APPROVED", "REJECTED"];
type Query = { search?: string; status?: string; sort?: string; page?: string; limit?: string };

export default async function ReviewPage({ searchParams }: { searchParams: Promise<Query> }) {
  const reviewer = await requireDashboardUser("review", "REVIEW");
  if (!reviewer.role?.submissionPermission.some((item) => item === "VIEW" || item === "SUBMIT")) {
    redirect(reviewer.role?.key === "STUDENT" ? "/submission" : "/forbidden");
  }
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const limit = [10, 25, 50].includes(Number(query.limit)) ? Number(query.limit) : 10;
  const status = statuses.includes(query.status as ReviewSubmissionStatus) ? (query.status ?? "") : "";
  const search = query.search?.trim() ?? "";
  const params = new URLSearchParams({ page: String(page), limit: String(limit), sort: query.sort || "-createdAt" });
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  const response = await serverApiFetch(`/submission?${params}`);
  const result = await response.json().catch(() => null);
  const items = response.ok && Array.isArray(result?.data) ? result.data as ReviewSubmission[] : [];
  const total = Number(result?.meta?.total ?? items.length);
  const pages = Math.max(1, Math.ceil(total / limit));

  return <main className="min-h-screen bg-[#f7f8fc] px-5 py-8 text-slate-900 sm:px-8 sm:py-10"><div className="mx-auto max-w-7xl">
    <header className="mb-8"><p className="mb-2 text-sm font-medium text-blue-700">{reviewer.role?.name ?? "Workspace"}</p><h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Review submissions</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Review project work, track progress, and give students actionable feedback.</p></header>
    <form method="get" className="mb-5 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
      <label className="relative block"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><span className="sr-only">Search submissions</span><Input name="search" defaultValue={search} placeholder="Search projects or students" className="h-10 rounded-xl border-slate-200 pl-9 pr-3 text-sm shadow-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100" /></label>
      <Select name="status" defaultValue={status} aria-label="Filter by submission status" className="h-10 min-w-40 rounded-xl"><option value="">All statuses</option>{statuses.map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}</Select>
      <div className="flex gap-2"><Select name="limit" defaultValue={String(limit)} aria-label="Submissions per page" className="h-10 w-36 rounded-xl">{[10, 25, 50].map((size) => <option key={size} value={size}>{size} per page</option>)}</Select><input type="hidden" name="page" value="1" /><Button type="submit" className="h-10 rounded-xl bg-blue-700 px-4 text-white hover:bg-blue-800">Apply</Button></div>
    </form>

    {!response.ok ? <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{getApiError(result, "Unable to load the review queue.")}{response.status === 403 && <span> Your role also needs submission View permission to read the queue.</span>}</div> : <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <header className="flex flex-col gap-2 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"><div><h2 className="font-semibold">Review queue</h2><p className="mt-1 text-sm text-slate-500">{total} {total === 1 ? "submission" : "submissions"} {search || status ? "match your filters" : "to review"}</p></div><span className="text-xs font-medium text-slate-400">Page {page} of {pages}</span></header>
      {items.length ? <div className="divide-y divide-slate-100">{items.map((item) => <ReviewQueueItem key={item.id} submission={item} reviewerId={reviewer.id} />)}</div> : <div className="px-6 py-16 text-center"><p className="text-sm font-semibold text-slate-700">No submissions found</p><p className="mt-1 text-sm text-slate-500">Try changing or clearing your filters.</p></div>}
      <Pagination page={page} pages={pages} search={search} status={status} limit={limit} />
    </section>}
  </div></main>;
}

function Pagination({ page, pages, search, status, limit }: { page: number; pages: number; search: string; status: string; limit: number }) {
  const link = (target: number) => {
    const params = new URLSearchParams({ page: String(target), limit: String(limit), sort: "-createdAt" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    return `/review?${params.toString()}`;
  };
  return <PagePagination label="Review queue pages" summary={`Page ${page} of ${pages}`} page={page} pages={pages} previousHref={link(Math.max(1, page - 1))} nextHref={link(Math.min(pages, page + 1))} />;
}
