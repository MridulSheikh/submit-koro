"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Check, Mail, Plus, Search, ShieldCheck, UsersRound, X } from "lucide-react";

type Mentor = {
  id: number;
  name: string;
  email: string;
  specialty: string;
  students: number;
  status: "Active" | "Invited";
};

type TeamRole = {
  id: number;
  name: string;
  description: string;
  permissions: Record<PageKey, string>;
  members: number;
};

type PageKey = "overview" | "review" | "submissions" | "team";

const permissionPages: { key: PageKey; label: string; choices: string[] }[] = [
  { key: "overview", label: "Overview", choices: ["No access", "View"] },
  { key: "review", label: "Review Submissions", choices: ["No access", "View", "Review"] },
  { key: "submissions", label: "My Submissions", choices: ["No access", "View", "Submit"] },
  { key: "team", label: "Manage Team", choices: ["No access", "View", "Manage"] },
];

const emptyPermissions: Record<PageKey, string> = {
  overview: "No access",
  review: "No access",
  submissions: "No access",
  team: "No access",
};

const initialMentors: Mentor[] = [
  { id: 1, name: "Farhan Rahman", email: "farhan.rahman@example.com", specialty: "Frontend Development", students: 18, status: "Active" },
  { id: 2, name: "Maliha Chowdhury", email: "maliha.chowdhury@example.com", specialty: "UI/UX Design", students: 14, status: "Active" },
  { id: 3, name: "Tanvir Hasan", email: "tanvir.hasan@example.com", specialty: "Backend Development", students: 11, status: "Active" },
  { id: 4, name: "Nabila Islam", email: "nabila.islam@example.com", specialty: "JavaScript", students: 0, status: "Invited" },
];

const initialRoles: TeamRole[] = [
  { id: 1, name: "Administrator", description: "Manage workspace settings and team access.", permissions: { overview: "View", review: "Review", submissions: "View", team: "Manage" }, members: 1 },
  { id: 2, name: "Mentor", description: "Review projects and support assigned students.", permissions: { overview: "View", review: "Review", submissions: "View", team: "No access" }, members: 3 },
  { id: 3, name: "Student", description: "Submit projects and view feedback.", permissions: { overview: "No access", review: "No access", submissions: "Submit", team: "No access" }, members: 24 },
];

type StatusFilter = "All team members" | "Active" | "Invited";

export default function ManageMentorsPage() {
  const [mentors, setMentors] = useState(initialMentors);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All team members");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [roles, setRoles] = useState(initialRoles);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [rolePermissions, setRolePermissions] = useState<Record<PageKey, string>>({ ...emptyPermissions });
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);

  const visibleMentors = useMemo(() => {
    const query = search.trim().toLowerCase();
    return mentors.filter((mentor) => {
      const matchesStatus = statusFilter === "All team members" || mentor.status === statusFilter;
      const matchesSearch = !query || `${mentor.name} ${mentor.email} ${mentor.specialty}`.toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [mentors, search, statusFilter]);

  function addMentor(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMentors((current) => [
      { id: Date.now(), name: name.trim(), email: email.trim(), specialty: specialty.trim(), students: 0, status: "Invited" },
      ...current,
    ]);
    setName("");
    setEmail("");
    setSpecialty("");
    setShowForm(false);
    setStatusFilter("All team members");
    setSearch("");
  }

  function toggleStatus(id: number) {
    setMentors((current) => current.map((mentor) => {
      if (mentor.id !== id) return mentor;
      const status = mentor.status === "Active" ? "Invited" : "Active";
      return { ...mentor, status };
    }));
  }

  function addRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (editingRoleId !== null) {
      setRoles((current) => current.map((role) => role.id === editingRoleId
        ? { ...role, name: roleName.trim(), description: roleDescription.trim(), permissions: rolePermissions }
        : role));
    } else {
      setRoles((current) => [
        { id: Date.now(), name: roleName.trim(), description: roleDescription.trim(), permissions: rolePermissions, members: 0 },
        ...current,
      ]);
    }
    setRoleName("");
    setRoleDescription("");
    setRolePermissions({ ...emptyPermissions });
    setEditingRoleId(null);
    setShowRoleForm(false);
  }

  function openRoleEditor(role?: TeamRole) {
    setEditingRoleId(role?.id ?? null);
    setRoleName(role?.name ?? "");
    setRoleDescription(role?.description ?? "");
    setRolePermissions(role ? { ...role.permissions } : { ...emptyPermissions });
    setShowRoleForm(true);
  }

  function closeRoleEditor() {
    setShowRoleForm(false);
    setEditingRoleId(null);
    setRoleName("");
    setRoleDescription("");
    setRolePermissions({ ...emptyPermissions });
  }

  const activeCount = mentors.filter((mentor) => mentor.status === "Active").length;
  const invitedCount = mentors.filter((mentor) => mentor.status === "Invited").length;
  const studentCount = mentors.reduce((total, mentor) => total + mentor.students, 0);

  return (
    <div className="min-h-screen flex-1 bg-[#f7f8fc] text-slate-900">
      <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-5 backdrop-blur-xl sm:px-8">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Workspace</span><span className="text-slate-300">/</span><span className="font-semibold text-slate-800">Manage team</span>
        </div>
        <span className="hidden rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 sm:inline-flex">Team administration</span>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-blue-700">Team administration</p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Manage team</h1>
            <p className="mt-2 text-sm text-slate-500">Invite team members and keep track of their student groups.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => openRoleEditor()} className="inline-flex h-10 w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"><ShieldCheck className="size-4 text-blue-700" />Add role</button>
            <button type="button" onClick={() => setShowForm(true)} className="inline-flex h-10 w-fit items-center gap-2 rounded-xl bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-800"><Plus className="size-4" />Add team member</button>
          </div>
        </div>

        {showForm && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setShowForm(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setShowForm(false);
            }}
          >
            <section role="dialog" aria-modal="true" aria-labelledby="add-mentor-title" className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20 sm:p-7">
              <div className="mb-6 flex items-start justify-between">
              <div><h2 id="add-mentor-title" className="text-lg font-semibold">Add a team member</h2><p className="mt-1 text-sm text-slate-500">Enter their details to add them to your team.</p></div>
                <button type="button" aria-label="Close dialog" onClick={() => setShowForm(false)} className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="size-4" /></button>
              </div>
              <form onSubmit={addMentor}>
                <div className="grid gap-4">
                  <label className="text-sm font-medium text-slate-700">Full name<input required autoFocus value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Ayesha Karim" className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                  <label className="text-sm font-medium text-slate-700">Email address<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                  <label className="text-sm font-medium text-slate-700">Specialty<input required value={specialty} onChange={(event) => setSpecialty(event.target.value)} placeholder="e.g. Product Design" className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                </div>
                <div className="mt-7 flex justify-end gap-3">
                  <button type="button" onClick={() => setShowForm(false)} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"><Mail className="size-4" /> Add team member</button>
                </div>
              </form>
            </section>
          </div>
        )}

        {showRoleForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]" onMouseDown={(event) => { if (event.target === event.currentTarget) closeRoleEditor(); }} onKeyDown={(event) => { if (event.key === "Escape") closeRoleEditor(); }}>
            <section role="dialog" aria-modal="true" aria-labelledby="add-role-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-950/20 sm:p-7">
              <div className="mb-6 flex items-start justify-between"><div><h2 id="add-role-title" className="text-lg font-semibold">{editingRoleId === null ? "Add a role" : "Edit role rules"}</h2><p className="mt-1 text-sm text-slate-500">Set the role description and its default access.</p></div><button type="button" aria-label="Close dialog" onClick={closeRoleEditor} className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><X className="size-4" /></button></div>
              <form onSubmit={addRole} className="space-y-4">
                <label className="block text-sm font-medium text-slate-700">Role name<input required value={roleName} onChange={(event) => setRoleName(event.target.value)} placeholder="e.g. Reviewer" className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                <label className="block text-sm font-medium text-slate-700">Description<textarea required rows={3} value={roleDescription} onChange={(event) => setRoleDescription(event.target.value)} placeholder="What does this role do?" className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" /></label>
                <fieldset>
                  <legend className="text-sm font-medium text-slate-700">Page permissions</legend>
                  <p className="mt-1 text-xs text-slate-500">Set access independently for each page.</p>
                  <div className="mt-3 space-y-2">
                    {permissionPages.map(({ key, label, choices }) => (
                      <label key={key} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2.5">
                        <span className="text-sm font-medium text-slate-700">{label}</span>
                        <select value={rolePermissions[key]} onChange={(event) => setRolePermissions((current) => ({ ...current, [key]: event.target.value }))} className="h-9 min-w-32 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-normal outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                          {choices.map((choice) => <option key={choice}>{choice}</option>)}
                        </select>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="flex justify-end gap-3 pt-3"><button type="button" onClick={closeRoleEditor} className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50">Cancel</button><button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-semibold text-white transition hover:bg-blue-800">{editingRoleId === null && <Plus className="size-4" />}{editingRoleId === null ? "Create role" : "Save changes"}</button></div>
              </form>
            </section>
          </div>
        )}

        <section aria-label="Team statistics" className="mb-6 grid gap-4 sm:grid-cols-3">
          <Metric label="Team members" value={String(mentors.length)} icon={UsersRound} tone="blue" />
          <Metric label="Active members" value={String(activeCount)} icon={Check} tone="green" />
          <Metric label="Students supported" value={String(studentCount)} icon={UsersRound} tone="blue" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div><h2 className="font-semibold">Team directory</h2><p className="mt-1 text-sm text-slate-500">{mentors.length} team members · {invitedCount} pending {invitedCount === 1 ? "invitation" : "invitations"}</p></div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-slate-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100">
                <Search className="size-4" /><span className="sr-only">Search team members</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search team" className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:w-44" />
              </label>
              <select aria-label="Filter team members by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as StatusFilter)} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100">
                <option>All team members</option><option>Active</option><option>Invited</option>
              </select>
            </div>
          </div>

          {visibleMentors.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><th className="px-6 py-3">Team member</th><th className="px-5 py-3">Specialty</th><th className="px-5 py-3">Students</th><th className="px-5 py-3">Status</th><th className="px-6 py-3 text-right">Manage</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {visibleMentors.map((mentor) => (
                    <tr key={mentor.id} className="transition hover:bg-slate-50/70">
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-700">{mentor.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div><p className="text-sm font-semibold text-slate-800">{mentor.name}</p><p className="mt-0.5 text-xs text-slate-500">{mentor.email}</p></div></div></td>
                      <td className="px-5 py-4 text-sm text-slate-600">{mentor.specialty}</td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-700">{mentor.students}</td>
                      <td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${mentor.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{mentor.status}</span></td>
                      <td className="px-6 py-4 text-right"><button type="button" onClick={() => toggleStatus(mentor.id)} className="text-xs font-semibold text-blue-700 hover:text-blue-900">{mentor.status === "Active" ? "Deactivate" : "Mark active"}</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center"><p className="text-sm font-medium text-slate-700">No team members found</p><p className="mt-1 text-sm text-slate-500">Try another search or status filter.</p></div>
          )}
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6"><h2 className="font-semibold">Roles and access</h2><p className="mt-1 text-sm text-slate-500">Review the roles available in your workspace.</p></div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><th className="px-6 py-3">Role</th><th className="px-5 py-3">Description</th><th className="px-5 py-3">Page permissions</th><th className="px-5 py-3 text-right">Members</th><th className="px-6 py-3 text-right">Manage</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{roles.map((role) => <tr key={role.id} className="hover:bg-slate-50/70"><td className="px-6 py-4"><span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-800"><ShieldCheck className="size-4 text-blue-700" />{role.name}</span></td><td className="px-5 py-4 text-sm text-slate-600">{role.description}</td><td className="px-5 py-4"><div className="flex max-w-[420px] flex-wrap gap-1.5">{permissionPages.map(({ key, label }) => <span key={key} className={`rounded-full px-2 py-1 text-[11px] font-medium ${role.permissions[key] === "No access" ? "bg-slate-100 text-slate-500" : "bg-blue-50 text-blue-700"}`}>{label}: {role.permissions[key]}</span>)}</div></td><td className="px-5 py-4 text-right text-sm font-medium text-slate-700">{role.members}</td><td className="px-6 py-4 text-right"><button type="button" onClick={() => openRoleEditor(role)} className="text-xs font-semibold text-blue-700 hover:text-blue-900">Edit rules</button></td></tr>)}</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof UsersRound; tone: "blue" | "green" }) {
  const iconStyles = tone === "green" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700";
  return (
    <article className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.025)]">
      <div><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold tracking-tight">{value}</p></div>
      <span className={`flex size-10 items-center justify-center rounded-xl ${iconStyles}`}><Icon className="size-5" /></span>
    </article>
  );
}
