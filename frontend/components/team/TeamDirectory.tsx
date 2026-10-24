import { Search, ShieldCheck, UserRound } from "lucide-react";
import Image from "next/image";
import { AssignRoleForm } from "@/components/team/ManageTeam";
import type { TeamRole, TeamUser } from "@/components/team/types";
import PagePagination from "@/components/shared/PagePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import UserStatusAction from "@/components/team/UserStatusAction";

type Props = {
  users: TeamUser[];
  roles: TeamRole[];
  currentUserId: string;
  canManage: boolean;
  error?: string;
  search: string;
  status: string;
  roleKey: string;
  limit: number;
  page: number;
  pages: number;
  total: number;
};

export default function TeamDirectory({ users, roles, currentUserId, canManage, error, search, status, roleKey, limit, page, pages, total }: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <header className="border-b border-slate-100 px-5 py-5 sm:px-6"><h2 className="font-semibold">Team directory</h2><p className="mt-1 text-sm text-slate-500">{total} team members</p></header>
      <form method="get" className="grid gap-3 border-b border-slate-100 bg-slate-50/50 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="relative block sm:col-span-2"><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><span className="sr-only">Search team members</span><Input name="search" defaultValue={search} placeholder="Search name or email" className="h-10 rounded-xl border-slate-200 bg-white pl-9 pr-3 text-sm shadow-none focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-100" /></label>
        <Select name="roleKey" defaultValue={roleKey} aria-label="Filter by role"><option value="">All roles</option>{roles.map((role) => <option key={role.id} value={role.key}>{role.name}</option>)}</Select>
        <Select name="status" defaultValue={status} aria-label="Filter by status"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option></Select>
        <div className="flex gap-2"><Select name="limit" defaultValue={String(limit)} aria-label="Users per page" className="flex-1">{[10, 25, 50, 100].map((size) => <option key={size} value={size}>{size} per page</option>)}</Select><input type="hidden" name="page" value="1" /><Button type="submit" className="h-10 bg-blue-700 px-4 text-white hover:bg-blue-800">Apply</Button></div>
      </form>
      {error ? <div role="alert" className="m-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">{error}</div> : users.length ? <div className="divide-y divide-slate-100">
        {users.map((member) => <article key={member.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-blue-700">{member.image ? <Image src={member.image} width={40} height={40} alt="" unoptimized className="size-full object-cover" /> : <UserRound className="size-5" />}</span><div className="min-w-0"><p className="truncate text-sm font-semibold">{member.name}</p><p className="truncate text-xs text-slate-500">{member.email}</p><p className="mt-1 text-[11px] text-slate-400">{member.emailVerified ? "Verified" : "Unverified"} · {member._count?.submissions ?? 0} submissions · Joined {new Date(member.createdAt).toLocaleDateString()}</p></div></div>
          <div className="flex flex-wrap items-center justify-between gap-3 sm:justify-end"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${member.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{member.status ?? "Unknown"}</span>{canManage ? member.id === currentUserId ? <span className="text-xs text-slate-400">Your account</span> : member.role?.key === "SUPER_ADMIN" ? <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400"><ShieldCheck className="size-3.5" />Protected</span> : <><AssignRoleForm userId={member.id} currentRoleKey={member.role?.key ?? null} roles={roles} /><UserStatusAction userId={member.id} name={member.name} status={member.status} /></> : <span className="text-xs text-slate-500">{member.role?.name ?? "No role"}</span>}</div>
        </article>)}
      </div> : <p className="px-6 py-12 text-center text-sm text-slate-500">No team members match these filters.</p>}
      {!error && <TeamPagination page={page} pages={pages} total={total} limit={limit} search={search} status={status} roleKey={roleKey} />}
    </section>
  );
}

function TeamPagination({ page, pages, total, limit, search, status, roleKey }: Omit<Props, "users" | "roles" | "currentUserId" | "canManage" | "error">) {
  const href = (target: number) => {
    const params = new URLSearchParams({ page: String(target), limit: String(limit), sort: "-createdAt" });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    if (roleKey) params.set("roleKey", roleKey);
    return `/mentors?${params.toString()}`;
  };
  const firstItem = total === 0 ? 0 : (page - 1) * limit + 1;
  const lastItem = Math.min(page * limit, total);
  return <PagePagination label="Team member pages" summary={`Showing ${firstItem}–${lastItem} of ${total} · Page ${page} of ${pages}`} page={page} pages={pages} previousHref={href(Math.max(1, page - 1))} nextHref={href(Math.min(pages, page + 1))} />;
}
