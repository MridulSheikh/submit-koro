"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiBaseUrl, getApiError } from "@/lib/api";
import RoleEditorModal from "@/components/team/RoleEditorModal";
import type { TeamRole } from "@/components/team/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select } from "@/components/ui/select";
import { withMutationToast } from "@/lib/mutation-toast";

type Role = TeamRole;

export default function ManageTeam() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  return (
    <>
      <div className="mb-5 flex justify-end">
        <Button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="h-10 gap-2 rounded-xl bg-blue-700 px-4 text-white hover:bg-blue-800"
        >
          <Plus className="size-4" />
          Create role
        </Button>
      </div>
      {isCreateOpen && (
        <RoleEditorModal role={null} onClose={() => setIsCreateOpen(false)} />
      )}
    </>
  );
}

export function RoleRowActions({ role }: { role: Role }) {
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const isProtected = role.key === "SUPER_ADMIN" || role.key === "STUDENT";

  async function deleteRole() {
    if (isProtected) return;
    setError("");
    setDeleting(true);
    try {
      await withMutationToast(
        {
          loading: "Deleting role…",
          success: "Role deleted.",
          error: "Unable to delete this role.",
        },
        async () => {
          const response = await fetch(`${apiBaseUrl()}/api/roles/${role.id}`, {
            method: "DELETE",
            credentials: "include",
          });
          const result: unknown = await response.json();
          if (!response.ok)
            throw new Error(getApiError(result, "Unable to delete this role."));
        },
      );
      setConfirmDelete(false);
      router.refresh();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to delete this role.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setEditing(true)}
          disabled={isProtected}
          title={
            isProtected
              ? "Protected system role cannot be edited"
              : `Edit ${role.name}`
          }
        >
          <Pencil className="size-3.5" />
          Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => setConfirmDelete(true)}
          disabled={isProtected || deleting}
          title={
            isProtected
              ? "Protected system role cannot be deleted"
              : `Delete ${role.name}`
          }
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </div>
      {error && (
        <p
          role="alert"
          className="max-w-64 text-right text-[11px] text-red-700"
        >
          {error}
        </p>
      )}
      {editing && (
        <RoleEditorModal
          key={role.id}
          role={role}
          onClose={() => setEditing(false)}
        />
      )}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div>
              <DialogTitle>Delete {role.name}?</DialogTitle>
              <DialogDescription>
                This role will be removed from the team. This action cannot be
                undone.
              </DialogDescription>
            </div>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <DialogClose
              render={
                <Button type="button" variant="outline" disabled={deleting} />
              }
            >
              Cancel
            </DialogClose>
            <Button
              type="button"
              variant="destructive"
              disabled={deleting}
              onClick={() => void deleteRole()}
            >
              {deleting ? "Deleting…" : "Delete role"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function AssignRoleForm({
  userId,
  currentRoleKey,
  roles,
}: {
  userId: string;
  currentRoleKey: string | null;
  roles: Role[];
}) {
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRoleKey ?? "");
  const router = useRouter();

  async function assign(roleKey: string) {
    if (!roleKey || roleKey === selectedRole) return;
    const previousRole = selectedRole;
    setSelectedRole(roleKey);
    setError("");
    setSaving(true);
    try {
      await withMutationToast(
        {
          loading: "Updating team role…",
          success: "Team role updated.",
          error: "Unable to assign this role.",
        },
        async () => {
          const response = await fetch(
            `${apiBaseUrl()}/api/users/${encodeURIComponent(userId)}/role`,
            {
              method: "PATCH",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ roleKey }),
            },
          );
          const result: unknown = await response.json();
          if (!response.ok)
            throw new Error(getApiError(result, "Unable to assign this role."));
        },
      );
      router.refresh();
    } catch (cause) {
      setSelectedRole(previousRole);
      setError(
        cause instanceof Error ? cause.message : "Unable to assign this role.",
      );
    } finally {
      setSaving(false);
    }
  }

  const assignableRoles = roles.filter((role) => role.key !== "SUPER_ADMIN");
  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <label className="sr-only" htmlFor={`role-${userId}`}>
        Role for {userId}
      </label>
      <Select
        id={`role-${userId}`}
        name="roleKey"
        value={selectedRole}
        onChange={(event) => void assign(event.target.value)}
        disabled={saving || !assignableRoles.length}
        required
        className="h-9 max-w-40 px-2 text-xs"
      >
        {!currentRoleKey && (
          <option value="" disabled>
            Unassigned
          </option>
        )}
        {assignableRoles.map((role) => (
          <option key={role.id} value={role.key}>
            {role.name}
          </option>
        ))}
      </Select>
      {saving && (
        <span className="text-[11px] text-slate-500" role="status">
          Saving role…
        </span>
      )}
      {error && (
        <p
          role="alert"
          className="max-w-56 text-right text-[11px] text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}
