"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { apiBaseUrl, getApiError } from "@/lib/api";
import { withMutationToast } from "@/lib/mutation-toast";
import type { Submission } from "@/components/submission/types";

export default function SubmissionDeleteDialog({
  submission,
  open,
  onOpenChange,
}: {
  submission: Submission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [apiError, setApiError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  async function removeSubmission() {
    setApiError("");
    setIsDeleting(true);
    try {
      await withMutationToast(
        {
          loading: "Deleting submission…",
          success: "Submission deleted.",
          error: "Unable to delete the submission.",
        },
        async () => {
          const response = await fetch(
            `${apiBaseUrl()}/api/submission/${encodeURIComponent(submission.id)}`,
            { method: "DELETE", credentials: "include" },
          );
          const result: unknown = await response.json();
          if (!response.ok) {
            throw new Error(getApiError(result, "Unable to delete the submission."));
          }
        },
      );
      onOpenChange(false);
      router.refresh();
    } catch (cause) {
      setApiError(
        cause instanceof Error ? cause.message : "Unable to delete the submission.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div>
            <DialogTitle>Delete this submission?</DialogTitle>
            <DialogDescription>
              “{submission.projectName}” will be permanently deleted. This action cannot be undone.
            </DialogDescription>
          </div>
        </DialogHeader>
        {apiError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{apiError}</p>}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isDeleting}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={() => void removeSubmission()} disabled={isDeleting}>
            {isDeleting ? "Deleting…" : "Delete submission"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
