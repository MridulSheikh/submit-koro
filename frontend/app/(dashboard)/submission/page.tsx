import { FileText, Search } from "lucide-react";
import { redirect } from "next/navigation";
import PagePagination from "@/components/shared/PagePagination";
import SubmissionCreateForm from "@/components/submission/SubmissionCreateForm";
import SubmissionActions from "@/components/submission/SubmissionActions";
import SubmissionStatusBadge from "@/components/submission/SubmissionStatusBadge";
import type {
  Submission,
  SubmissionStatus,
} from "@/components/submission/types";
import { requireDashboardUser } from "@/lib/auth/server";
import { getApiError, serverApiFetch } from "@/lib/server-api";

type Query = {
  search?: string;
  status?: string;
  sort?: string;
  page?: string;
  limit?: string;
};
const statuses: SubmissionStatus[] = [
  "PENDING",
  "IN_REVIEW",
  "REVIEWED",
  "APPROVED",
  "REJECTED",
];

export default async function SubmissionPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const user = await requireDashboardUser();
  if (
    !user.role?.submissionPermission.some(
      (item) => item === "SUBMIT" || item === "VIEW",
    )
  ) {
    redirect("/forbidden");
  }
  const query = await searchParams;
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 10));
  const status = statuses.includes(query.status as SubmissionStatus)
    ? (query.status ?? "")
    : "";
  const search = query.search?.trim() ?? "";
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort: query.sort || "-createdAt",
  });
  if (status) params.set("status", status);
  if (search) params.set("search", search);
  const response = await serverApiFetch(
    `/submission/user/${encodeURIComponent(user.id)}?${params}`,
  );
  const result = await response.json().catch(() => null);
  const items =
    response.ok && Array.isArray(result?.data)
      ? (result.data as Submission[])
      : [];
  const total = Number(result?.meta?.total ?? items.length);
  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-5 py-8 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-700">
              Submission history
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              My submissions
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Track your submitted projects and review status.
            </p>
          </div>
          {user.role?.submissionPermission.includes("SUBMIT") && (
            <SubmissionCreateForm />
          )}
        </header>
        <form
          method="get"
          className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row"
        >
          <label className="flex h-10 flex-1 items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400">
            <Search className="size-4" />
            <span className="sr-only">Search submissions</span>
            <input
              name="search"
              defaultValue={search}
              placeholder="Search project name or URL"
              className="w-full bg-transparent text-sm text-slate-800 outline-none"
            />
          </label>
          <select
            name="status"
            defaultValue={status}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm"
          >
            <option value="">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
          <input type="hidden" name="page" value="1" />
          <button className="h-10 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white">
            Apply filters
          </button>
        </form>
        {!response.ok ? (
          <div
            role="alert"
            className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
          >
            {getApiError(result, "Unable to load your submissions.")}
          </div>
        ) : (
          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5">
              <h2 className="font-semibold">Project submissions</h2>
              <p className="mt-1 text-sm text-slate-500">
                {total} matching {total === 1 ? "project" : "projects"}
              </p>
            </div>
            {items.length ? (
              <div className="divide-y divide-slate-100">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="grid grid-cols-1 items-center gap-3 px-5 py-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto_auto] md:gap-5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                        <FileText className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {item.projectName}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Submitted{" "}
                          {new Date(item.createdAt).toLocaleDateString()}
                        </p>
                        {item.description && (
                          <p
                            className="mt-1 max-w-2xl truncate text-xs text-slate-500"
                            title={item.description}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <SubmissionStatusBadge status={item.status} />
                    <SubmissionActions
                      submission={item}
                      canEdit={Boolean(
                        user.role?.submissionPermission.includes("SUBMIT"),
                      )}
                    />
                  </article>
                ))}
              </div>
            ) : (
              <p className="px-6 py-12 text-center text-sm text-slate-500">
                No submissions match these filters.
              </p>
            )}
            <Pagination
              page={page}
              pages={pages}
              search={search}
              status={status}
              limit={limit}
            />
          </section>
        )}
      </div>
    </main>
  );
}

function Pagination({
  page,
  pages,
  search,
  status,
  limit,
}: {
  page: number;
  pages: number;
  search: string;
  status: string;
  limit: number;
}) {
  const link = (target: number) => {
    const params = new URLSearchParams({
      page: String(target),
      limit: String(limit),
    });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    return `/submission?${params}`;
  };
  return (
    <PagePagination
      label="Submission pages"
      summary={`Page ${page} of ${pages}`}
      page={page}
      pages={pages}
      previousHref={link(Math.max(1, page - 1))}
      nextHref={link(Math.min(pages, page + 1))}
    />
  );
}
