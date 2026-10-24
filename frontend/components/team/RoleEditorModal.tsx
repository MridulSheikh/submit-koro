"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import type { Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RolePermissionFields from "@/components/team/RolePermissionFields";
import { apiBaseUrl, getApiError } from "@/lib/api";
import { roleSchema, type RoleFormValues } from "@/lib/schemas/role.schema";
import type { TeamRole } from "@/components/team/types";
import { withMutationToast } from "@/lib/mutation-toast";

export type { TeamRole } from "@/components/team/types";

const noAccess = ["NO_ACCESS"] as const;

export default function RoleEditorModal({
  role,
  onClose,
}: {
  role: TeamRole | null;
  onClose: () => void;
}) {
  const [apiError, setApiError] = useState("");
  const router = useRouter();
  const { register, handleSubmit, watch, getValues, setValue, formState: { errors, isSubmitting } } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema) as Resolver<RoleFormValues>,
    mode: "onTouched",
    defaultValues: {
      name: role?.name ?? "",
      key: role?.key ?? "",
      overviewPermission: (role?.overviewPermission.length ? role.overviewPermission : [...noAccess]) as RoleFormValues["overviewPermission"],
      reviewPermission: (role?.reviewPermission.length ? role.reviewPermission : [...noAccess]) as RoleFormValues["reviewPermission"],
      submissionPermission: (role?.submissionPermission.length ? role.submissionPermission : [...noAccess]) as RoleFormValues["submissionPermission"],
      teamPermission: (role?.teamPermission.length ? role.teamPermission : [...noAccess]) as RoleFormValues["teamPermission"],
    },
  });

  function togglePermission(field: keyof Pick<RoleFormValues, "overviewPermission" | "reviewPermission" | "submissionPermission" | "teamPermission">, permission: string, checked: boolean) {
    const selected = getValues(field) as string[];
    let next: string[];
    if (permission === "NO_ACCESS" && checked) {
      next = ["NO_ACCESS"];
    } else if (permission === "NO_ACCESS") {
      next = selected.filter((value) => value !== "NO_ACCESS");
    } else if (checked) {
      next = [...selected.filter((value) => value !== "NO_ACCESS"), permission];
    } else {
      next = selected.filter((value) => value !== permission);
    }
    setValue(field, next as RoleFormValues[typeof field], { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  }

  async function save(values: RoleFormValues) {
    setApiError("");
    try {
      await withMutationToast({
        loading: role ? "Updating role…" : "Creating role…",
        success: role ? "Role updated." : "Role created.",
        error: "Unable to save this role.",
      }, async () => {
        const response = await fetch(`${apiBaseUrl()}/api/roles${role ? `/${role.id}` : ""}`, {
          method: role ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const result: unknown = await response.json();
        if (!response.ok) throw new Error(getApiError(result, "Unable to save this role."));
        return result;
      });
      onClose();
      router.refresh();
    } catch (cause) {
      setApiError(cause instanceof Error ? cause.message : "Unable to save this role.");
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <div>
            <DialogTitle>{role ? `Edit ${role.name}` : "Create a role"}</DialogTitle>
            <DialogDescription>Set the permissions available to this role.</DialogDescription>
          </div>
          <DialogClose render={<Button type="button" variant="ghost" size="icon-sm" aria-label="Close role editor" />}><X /><span className="sr-only">Close</span></DialogClose>
        </DialogHeader>

        <form onSubmit={handleSubmit(save)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="role-name">Role name</Label>
            <Input id="role-name" autoComplete="off" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "role-name-error" : undefined} {...register("name")} />
            {errors.name && <p id="role-name-error" className="text-xs text-red-700" role="alert">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-key">Role key</Label>
            <Input id="role-key" autoComplete="off" className="uppercase" aria-invalid={Boolean(errors.key)} aria-describedby={errors.key ? "role-key-error" : undefined} {...register("key", { onChange: (event) => setValue("key", event.target.value.toUpperCase().replaceAll(" ", "_"), { shouldValidate: true }) })} />
            {errors.key && <p id="role-key-error" className="text-xs text-red-700" role="alert">{errors.key.message}</p>}
          </div>

          <RolePermissionFields
            values={{
              overviewPermission: watch("overviewPermission"),
              reviewPermission: watch("reviewPermission"),
              submissionPermission: watch("submissionPermission"),
              teamPermission: watch("teamPermission"),
            }}
            errors={errors}
            onToggle={togglePermission}
          />

          {apiError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{apiError}</p>}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : role ? "Save changes" : "Create role"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
