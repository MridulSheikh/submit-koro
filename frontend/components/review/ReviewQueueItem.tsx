"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import ReviewForm from "@/components/review/ReviewForm";
import SubmissionDetails from "@/components/review/SubmissionDetails";
import WithdrawReviewButton from "@/components/review/WithdrawReviewButton";
import type { ReviewSubmission, ReviewSubmissionStatus } from "@/components/review/types";
import { apiBaseUrl, getApiError } from "@/lib/api";
import { withMutationToast } from "@/lib/mutation-toast";

const statuses: ReviewSubmissionStatus[] = ["PENDING", "IN_REVIEW", "REVIEWED", "APPROVED", "REJECTED"];
const statusStyles: Record<ReviewSubmissionStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  IN_REVIEW: "bg-blue-50 text-blue-800 ring-blue-200",
  REVIEWED: "bg-violet-50 text-violet-800 ring-violet-200",
  APPROVED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-800 ring-rose-200",
};

export default function ReviewQueueItem({ submission, reviewerId }: { submission: ReviewSubmission; reviewerId: string }) {
  const [status, setStatus] = useState(submission.status);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const router = useRouter();
  const hasReviewed = submission.reviews?.some((review) => review.reviewerId === reviewerId) ?? false;

  async function changeStatus(nextStatus: ReviewSubmissionStatus) {
    if (nextStatus === status || updatingStatus) return;
    const previousStatus = status;
    setStatus(nextStatus);
    setUpdatingStatus(true);
    try {
      await withMutationToast({ loading: "Updating submission status…", success: "Submission status updated.", error: "Unable to update submission status." }, async () => {
        const response = await fetch(`${apiBaseUrl()}/api/submission/review/${encodeURIComponent(submission.id)}/status`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        const result: unknown = await response.json();
        if (!response.ok) throw new Error(getApiError(result, "Unable to update submission status."));
      });
      router.refresh();
    } catch {
      setStatus(previousStatus);
    } finally {
      setUpdatingStatus(false);
    }
  }

  return <article className="px-5 py-5 transition-colors hover:bg-slate-50/40 sm:px-6">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2"><h3 className="text-base font-semibold tracking-tight text-slate-900">{submission.projectName}</h3><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${statusStyles[status]}`}>{status.replaceAll("_", " ")}</span></div>
        <p className="mt-1.5 text-sm text-slate-600">{submission.user?.name ?? "Student"}<span className="text-slate-400"> · </span>{submission.user?.email ?? "Email unavailable"}</p>
        <p className="mt-1 text-xs text-slate-400">Submitted {new Date(submission.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}</p>
        {submission.reviews?.length ? <p className="mt-3 text-xs font-medium text-slate-500">{submission.reviews.length} {submission.reviews.length === 1 ? "review" : "reviews"} submitted</p> : <p className="mt-3 text-xs text-slate-400">No reviews yet</p>}
      </div>
      <div className="flex flex-wrap items-end gap-2 lg:justify-end">
        <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-500"><span>Submission status</span><Select aria-label={`Status for ${submission.projectName}`} value={status} disabled={updatingStatus} onChange={(event) => void changeStatus(event.target.value as ReviewSubmissionStatus)} className="h-9 min-w-40 rounded-lg px-2.5 text-xs font-semibold"><option value="PENDING">Pending</option><option value="IN_REVIEW">In review</option><option value="REVIEWED">Reviewed</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></Select></label>
        <Button type="button" variant="outline" className="h-9" onClick={() => setDetailsOpen(true)}>Details</Button>
        {hasReviewed ? <span className="inline-flex h-9 items-center rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700">Review submitted</span> : <ReviewForm submissionId={submission.id} reviewerId={reviewerId} projectName={submission.projectName} />}
      </div>
    </div>
    {submission.reviews?.length ? <div className="mt-5 space-y-2">{submission.reviews.map((review) => <div key={review.id} className="rounded-lg border border-slate-100 bg-white p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap items-center gap-2"><p className="text-xs font-semibold text-slate-700">{review.reviewer?.name ?? "Reviewer"}</p>{review.score != null && <span className="text-xs font-medium text-amber-700">Score {review.score}</span>}</div>{review.reviewerId === reviewerId && <WithdrawReviewButton reviewId={review.id} projectName={submission.projectName} />}</div><p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-slate-600">{review.feedback}</p></div>)}</div> : null}
    <SubmissionDetails submission={submission} open={detailsOpen} onOpenChange={setDetailsOpen} />
  </article>;
}
