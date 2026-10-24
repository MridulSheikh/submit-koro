"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiBaseUrl, getApiError } from "@/lib/api";
import { withMutationToast } from "@/lib/mutation-toast";

const reviewSchema = z.object({
  feedback: z.string().trim().min(1, "Feedback is required").max(5000, "Feedback must be 5000 characters or fewer"),
  score: z.string().refine((value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 100), "Score must be between 0 and 100"),
});
type ReviewValues = z.infer<typeof reviewSchema>;

export default function ReviewForm({ submissionId, reviewerId, projectName }: { submissionId: string; reviewerId: string; projectName: string }) {
  const [open, setOpen] = useState(false);
  const [apiError, setApiError] = useState("");
  const router = useRouter();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ReviewValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { feedback: "", score: "" },
    mode: "onTouched",
  });

  async function submit(values: ReviewValues) {
    setApiError("");
    try {
      await withMutationToast({ loading: "Saving review…", success: "Review saved.", error: "Unable to save the review." }, async () => {
        const response = await fetch(`${apiBaseUrl()}/api/review`, {
          method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ submissionId, reviewerId, score: values.score === "" ? null : Number(values.score), feedback: values.feedback.trim() }),
        });
        const result: unknown = await response.json();
        if (!response.ok) throw new Error(getApiError(result, "Unable to save the review."));
      });
      reset();
      setOpen(false);
      router.refresh();
    } catch (cause) {
      setApiError(cause instanceof Error ? cause.message : "Unable to save the review.");
    }
  }

  return <>
    <Button type="button" className="h-9 px-3" onClick={() => { setApiError(""); setOpen(true); }}>Add review</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader><div><DialogTitle>Review {projectName}</DialogTitle><DialogDescription>Share clear, actionable feedback with the student.</DialogDescription></div></DialogHeader>
        <form onSubmit={handleSubmit(submit)} className="space-y-5" noValidate>
          <div className="space-y-2"><Label htmlFor={`review-feedback-${submissionId}`}>Feedback</Label><Textarea id={`review-feedback-${submissionId}`} placeholder="What went well? What could be improved?" aria-invalid={Boolean(errors.feedback)} aria-describedby={errors.feedback ? `review-feedback-error-${submissionId}` : undefined} {...register("feedback")} />{errors.feedback && <p id={`review-feedback-error-${submissionId}`} className="text-xs text-red-700" role="alert">{errors.feedback.message}</p>}</div>
          <div className="max-w-xs space-y-2"><Label htmlFor={`review-score-${submissionId}`}>Score <span className="font-normal text-slate-400">(optional, 0–100)</span></Label><Input id={`review-score-${submissionId}`} type="number" min="0" max="100" step="0.1" placeholder="e.g. 85" aria-invalid={Boolean(errors.score)} aria-describedby={errors.score ? `review-score-error-${submissionId}` : undefined} {...register("score")} />{errors.score && <p id={`review-score-error-${submissionId}`} className="text-xs text-red-700" role="alert">{errors.score.message}</p>}</div>
          {apiError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{apiError}</p>}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isSubmitting}>Cancel</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving…" : "Save review"}</Button></div>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}
