"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiBaseUrl, getApiError } from "@/lib/api";
import { withMutationToast } from "@/lib/mutation-toast";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be 128 characters or fewer"),
    confirmPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });

type ChangePasswordValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordDialog() {
  const [open, setOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    mode: "onTouched",
  });

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    setApiError("");
    if (!nextOpen) reset();
  }

  async function submit(values: ChangePasswordValues) {
    setApiError("");
    try {
      await withMutationToast(
        {
          loading: "Changing password…",
          success: "Password changed successfully.",
          error: "Unable to change your password.",
        },
        async () => {
          const response = await fetch(`${apiBaseUrl()}/api/users/me/password`, {
            method: "PATCH",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              currentPassword: values.currentPassword,
              newPassword: values.newPassword,
            }),
          });
          const result: unknown = await response.json().catch(() => null);
          if (!response.ok) {
            throw new Error(getApiError(result, "Unable to change your password."));
          }
        },
      );
      reset();
      setOpen(false);
    } catch (cause) {
      setApiError(
        cause instanceof Error ? cause.message : "Unable to change your password.",
      );
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => handleOpenChange(true)}
        className="h-10 gap-2 rounded-xl border-blue-200 bg-blue-50 px-4 font-semibold text-blue-800 shadow-sm hover:border-blue-300 hover:bg-blue-100 hover:text-blue-900 focus-visible:ring-blue-300"
      >
        <LockKeyhole className="size-4 text-blue-700" aria-hidden="true" />
        Change password
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader className="items-center">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100">
              <LockKeyhole className="size-5" aria-hidden="true" />
            </span>
            <div>
              <DialogTitle>Change password</DialogTitle>
              <DialogDescription>
                Verify your current password, then set a new one for your account.
              </DialogDescription>
            </div>
          </DialogHeader>
          <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
            <PasswordField
              id="current-password"
              label="Current password"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...register("currentPassword")}
            />
            <PasswordField
              id="new-password"
              label="New password"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              hint="Use 8–128 characters. Choose a password you do not use elsewhere."
              {...register("newPassword")}
            />
            <PasswordField
              id="confirm-password"
              label="Confirm new password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
            {apiError && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {apiError}
              </p>
            )}
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-blue-700 text-white hover:bg-blue-800">
                {isSubmitting ? "Changing…" : "Update password"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PasswordField({
  id,
  label,
  error,
  hint,
  ...inputProps
}: React.ComponentProps<typeof Input> & { id: string; label: string; error?: string; hint?: string }) {
  const [visible, setVisible] = useState(false);
  const describedBy = [error ? `${id}-error` : null, hint ? `${id}-hint` : null]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="h-11 rounded-xl border-slate-200 bg-slate-50/70 pr-12 shadow-none transition-colors focus-visible:bg-white"
          {...inputProps}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
          aria-controls={id}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-500 hover:bg-slate-200/70 hover:text-slate-800"
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </Button>
      </div>
      {hint && <p id={`${id}-hint`} className="text-xs leading-5 text-slate-500">{hint}</p>}
      {error && <p id={`${id}-error`} className="text-xs text-red-700" role="alert">{error}</p>}
    </div>
  );
}
