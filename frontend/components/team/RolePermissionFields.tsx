"use client";

import type { FieldErrors } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { RoleFormValues } from "@/lib/schemas/role.schema";

const groups = [
  { field: "overviewPermission", label: "Overview", options: ["NO_ACCESS", "VIEW"] },
  { field: "reviewPermission", label: "Review", options: ["NO_ACCESS", "VIEW", "REVIEW"] },
  { field: "submissionPermission", label: "Submissions", options: ["NO_ACCESS", "VIEW", "SUBMIT"] },
  { field: "teamPermission", label: "Team", options: ["NO_ACCESS", "VIEW", "MANAGE"] },
] as const;

type PermissionField = typeof groups[number]["field"];

export default function RolePermissionFields({
  values,
  errors,
  onToggle,
}: {
  values: Pick<RoleFormValues, PermissionField>;
  errors: FieldErrors<RoleFormValues>;
  onToggle: (field: PermissionField, permission: string, checked: boolean) => void;
}) {
  return (
    <div>
      <p className="mb-3 text-xs leading-5 text-slate-500">Select every rule the role needs. “No access” cannot be combined with other rules in that category.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map(({ field, label, options }) => {
          const error = errors[field]?.message;
          return (
            <fieldset key={field} className="rounded-lg border border-slate-200 p-3" aria-invalid={Boolean(error)}>
              <legend className="px-1 text-xs font-semibold text-slate-700">{label} permissions</legend>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-2">
                {options.map((permission) => {
                  const id = `role-${field}-${permission}`;
                  return (
                    <div key={permission} className="flex items-center gap-2">
                      <Checkbox id={id} checked={(values[field] as readonly string[]).includes(permission)} onCheckedChange={(checked) => onToggle(field, permission, checked)} aria-invalid={Boolean(error)} />
                      <Label htmlFor={id} className="cursor-pointer text-xs font-normal">{permission.replaceAll("_", " ")}</Label>
                    </div>
                  );
                })}
              </div>
              {typeof error === "string" && <p className="mt-2 text-xs text-red-700" role="alert">{error}</p>}
            </fieldset>
          );
        })}
      </div>
    </div>
  );
}
