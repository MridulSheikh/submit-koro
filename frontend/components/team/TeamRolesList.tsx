import { ShieldCheck } from "lucide-react";
import { RoleRowActions } from "@/components/team/ManageTeam";
import type { TeamRole } from "@/components/team/types";

export default function TeamRolesList({ roles, canManage }: { roles: TeamRole[]; canManage: boolean }) {
  return <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"><header className="border-b border-slate-100 px-5 py-5"><h2 className="font-semibold">Roles and permissions</h2><p className="mt-1 text-sm text-slate-500">Access available to team members.</p></header><div className="divide-y divide-slate-100">{roles.map((role) => <article key={role.id} className="px-5 py-4 sm:px-6"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><h3 className="inline-flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4 text-blue-700" />{role.name}<span className="font-mono text-[11px] text-slate-400">{role.key}</span></h3><p className="mt-1 text-xs text-slate-500">{role._count?.users ?? 0} assigned</p></div>{canManage && <RoleRowActions role={role} />}</div><div className="mt-2 flex flex-wrap gap-2">{permissionLabels(role).map((permission) => <span key={permission} className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700">{permission}</span>)}</div></article>)}</div></section>;
}

function permissionLabels(role: TeamRole) {
  return [
    ...role.overviewPermission.filter((value) => value !== "NO_ACCESS").map((value) => `Overview: ${value}`),
    ...role.reviewPermission.filter((value) => value !== "NO_ACCESS").map((value) => `Review: ${value}`),
    ...role.submissionPermission.filter((value) => value !== "NO_ACCESS").map((value) => `Submissions: ${value}`),
    ...role.teamPermission.filter((value) => value !== "NO_ACCESS").map((value) => `Team: ${value}`),
  ];
}
