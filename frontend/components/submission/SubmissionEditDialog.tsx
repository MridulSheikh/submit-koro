"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import type { Submission } from "@/components/submission/types";
import { apiBaseUrl, getApiError } from "@/lib/api";
import { withMutationToast } from "@/lib/mutation-toast";

const submissionSchema = z.object({
  projectName: z.string().trim().min(1, "Project name is required"),
  repositoryUrl: z.string().trim().url("Enter a valid repository URL"),
  liveUrl: z.string().trim().url("Enter a valid live project URL"),
  description: z.string().max(5000, "Description must be 5000 characters or fewer"),
});

type SubmissionFormValues = z.infer<typeof submissionSchema>;

export default function SubmissionEditDialog({
  submission,
  open,
  onOpenChange,
}: {
  submission: Submission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [apiError, setApiError] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubmissionFormValues>({
    resolver: zodResolver(submissionSchema),
    defaultValues: {
      projectName: submission.projectName,
      repositoryUrl: submission.repositoryUrl ?? "",
      liveUrl: submission.liveUrl ?? "",
      description: submission.description ?? "",
    },
    mode: "onTouched",
  });

  async function save(values: SubmissionFormValues) {
    setApiError("");
    try {
      await withMutationToast(
        {
          loading: "Updating submission…",
          success: "Submission updated.",
          error: "Unable to update the submission.",
        },
        async () => {
          const response = await fetch(
            `${apiBaseUrl()}/api/submission/${encodeURIComponent(submission.id)}`,
            {
              method: "PATCH",
              credentials: "include",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...values,
                description: values.description.trim() || null,
              }),
            },
          );
          const result: unknown = await response.json();
          if (!response.ok) {
            throw new Error(getApiError(result, "Unable to update the submission."));
          }
        },
      );
      onOpenChange(false);
      router.refresh();
    } catch (cause) {
      setApiError(
        cause instanceof Error ? cause.message : "Unable to update the submission.",
      );
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div>
            <DialogTitle>Edit submission</DialogTitle>
            <DialogDescription>Update the project details and links.</DialogDescription>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit(save)} className="space-y-4" noValidate>
          <Field
            id={`submission-name-${submission.id}`}
            label="Project name"
            error={errors.projectName?.message}
            {...register("projectName")}
          />
          <Field
            id={`submission-repository-${submission.id}`}
            label="Repository URL"
            type="url"
            error={errors.repositoryUrl?.message}
            {...register("repositoryUrl")}
          />
          <Field
            id={`submission-live-${submission.id}`}
            label="Live project URL"
            type="url"
            error={errors.liveUrl?.message}
            {...register("liveUrl")}
          />
          <div className="space-y-2">
            <Label htmlFor={`submission-description-${submission.id}`}>Description</Label>
            <Textarea
              id={`submission-description-${submission.id}`}
              rows={4}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? `submission-description-error-${submission.id}` : undefined}
              {...register("description")}
            />
            {errors.description && (
              <p id={`submission-description-error-${submission.id}`} className="text-xs text-red-700" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>
          {apiError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{apiError}</p>}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const Field = ({
  id,
  label,
  error,
  type = "text",
  ...inputProps
}: React.ComponentProps<typeof Input> & { id: string; label: string; error?: string }) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    <Input
      id={id}
      type={type}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-error` : undefined}
      {...inputProps}
    />
    {error && <p id={`${id}-error`} className="text-xs text-red-700" role="alert">{error}</p>}
  </div>
);
