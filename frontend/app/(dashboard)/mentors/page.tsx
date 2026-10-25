import { redirect } from "next/navigation";
import ManageTeam from "@/components/team/ManageTeam";
import TeamDirectory from "@/components/team/TeamDirectory";
import TeamRolesList from "@/components/team/TeamRolesList";
import type { TeamRole, TeamUser } from "@/components/team/types";
import { requireDashboardUser } from "@/lib/auth/server";
import { getApiError, serverApiFetch } from "@/lib/server-api";

type Query = {
  search?: string;
  status?: string;
  roleKey?: string;
  page?: string;
  limit?: string;
  sort?: string;
};

export default async function ManageTeamPage({
  searchParams,
}: {
  searchParams: Promise<Query>;
}) {
  const user = await requireDashboardUser();
  const canView = user.role?.teamPermission.some(
    (item) => item === "MANAGE" || item === "VIEW",
  );
  if (!canView)
    redirect(user.role?.key === "STUDENT" ? "/submission" : "/forbidden");

  const query = await searchParams;
  const search = query.search?.trim() ?? "";
  const status =
    query.status === "ACTIVE" || query.status === "INACTIVE"
      ? query.status
      : "";
  const page = Math.max(1, Number(query.page) || 1);
  const limit = [10, 25, 50, 100].includes(Number(query.limit))
    ? Number(query.limit)
    : 10;
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sort: query.sort || "-createdAt",
  });
  if (search) params.set("search", search);
  if (status) params.set("status", status);
  if (query.roleKey) params.set("roleKey", query.roleKey);

  const [rolesResponse, usersResponse] = await Promise.all([
    serverApiFetch("/roles"),
    serverApiFetch(`/users?${params.toString()}`),
  ]);
  const [rolesResult, usersResult] = await Promise.all([
    rolesResponse.json().catch(() => null),
    usersResponse.json().catch(() => null),
  ]);
  const roles =
    rolesResponse.ok && Array.isArray(rolesResult?.data)
      ? (rolesResult.data as TeamRole[])
      : [];
  const users =
    usersResponse.ok && Array.isArray(usersResult?.data)
      ? (usersResult.data as TeamUser[])
      : [];
  const total = Number(usersResult?.meta?.total ?? 0);
  const pages = Math.max(1, Math.ceil(total / limit));
  if (usersResponse.ok && page > pages) {
    params.set("page", String(pages));
    redirect(`/mentors?${params.toString()}`);
  }
  const canManage = user.role?.teamPermission.includes("MANAGE") ?? false;

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-5 py-8 text-slate-900 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-700">
            Workspace access
          </p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Manage team
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Find team members, filter the directory, and manage role access.
          </p>
        </header>
        {canManage && rolesResponse.ok && <ManageTeam />}
        {!rolesResponse.ok && (
          <div
            role="alert"
            className="mb-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
          >
            {getApiError(rolesResult, "Unable to load team roles.")}
          </div>
        )}
        <TeamDirectory
          users={users}
          roles={roles}
          currentUserId={user.id}
          canManage={canManage}
          error={
            !usersResponse.ok
              ? getApiError(usersResult, "Unable to load team members.")
              : undefined
          }
          search={search}
          status={status}
          roleKey={query.roleKey ?? ""}
          limit={limit}
          page={page}
          pages={pages}
          total={total}
        />
        {rolesResponse.ok && (
          <TeamRolesList roles={roles} canManage={canManage} />
        )}
      </div>
    </main>
  );
}
