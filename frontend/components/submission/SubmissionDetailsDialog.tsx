"use client";

import { Code2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Submission } from "@/components/submission/types";
import SubmissionStatusBadge from "@/components/submission/SubmissionStatusBadge";

export default function SubmissionDetailsDialog({
  submission,
  open,
  onOpenChange,
}: {
  submission: Submission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div>
            <DialogTitle>{submission.projectName}</DialogTitle>
            <DialogDescription>
              Submitted {new Date(submission.createdAt).toLocaleString()}
            </DialogDescription>
          </div>
        </DialogHeader>
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </span>
            <SubmissionStatusBadge status={submission.status} />
          </div>
          <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Project description
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {submission.description?.trim() || "No description was provided."}
            </p>
          </section>
          <div className="grid gap-3 sm:grid-cols-2">
            <LinkCard
              href={submission.repositoryUrl}
              icon={<Code2 className="size-4" aria-hidden="true" />}
              label="Repository URL"
              tone="repository"
            />
            <LinkCard
              href={submission.liveUrl}
              icon={<ExternalLink className="size-4" aria-hidden="true" />}
              label="Live project URL"
              tone="live"
            />
          </div>
          <section className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Reviews
            </h3>
            {submission.reviews?.length ? (
              submission.reviews.map((review) => (
                <article key={review.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {review.reviewer?.name ?? "Reviewer"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {review.score != null && (
                        <span className="font-semibold text-amber-700">Score {review.score}</span>
                      )}
                      <time dateTime={review.createdAt}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                    {review.feedback}
                  </p>
                </article>
              ))
            ) : (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-500">
                No review
              </p>
            )}
          </section>
          <div className="flex justify-end border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function LinkCard({
  href,
  icon,
  label,
  tone,
}: {
  href?: string | null;
  icon: React.ReactNode;
  label: string;
  tone: "repository" | "live";
}) {
  const colors =
    tone === "repository"
      ? { icon: "bg-indigo-50 text-indigo-700", arrow: "text-indigo-500" }
      : { icon: "bg-emerald-50 text-emerald-700", arrow: "text-emerald-600" };

  return href ? (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex min-h-16 min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 transition-colors hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${colors.icon}`}>
          {icon}
        </span>
        <span className="min-w-0">
          <span className="block text-xs font-semibold text-slate-800">{label}</span>
          <span className="mt-1 block break-all text-xs leading-5 text-slate-600" title={href}>
            {href}
          </span>
        </span>
      </span>
      <ExternalLink className={`size-4 shrink-0 ${colors.arrow}`} aria-hidden="true" />
    </a>
  ) : (
    <div className="flex min-h-16 items-center gap-3 rounded-xl border border-dashed border-slate-200 px-3.5 text-sm text-slate-400">
      <span className={`flex size-9 items-center justify-center rounded-lg ${colors.icon}`}>
        {icon}
      </span>
      {label} not provided
    </div>
  );
}
