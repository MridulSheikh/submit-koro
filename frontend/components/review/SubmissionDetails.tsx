"use client";

import { Code2, ExternalLink, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ReviewSubmission } from "@/components/review/types";

export default function SubmissionDetails({ submission, open, onOpenChange }: { submission: ReviewSubmission; open: boolean; onOpenChange: (open: boolean) => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl">
      <DialogHeader><div><DialogTitle>{submission.projectName}</DialogTitle><DialogDescription>Submitted {new Date(submission.createdAt).toLocaleString()}</DialogDescription></div></DialogHeader>
      <div className="space-y-5">
        <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4"><h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Project description</h3><p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{submission.description?.trim() || "No description was provided."}</p></section>
        <section className="rounded-xl border border-slate-200 p-4"><h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Submitted by</h3><div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700"><UserRound className="size-4" /></span><div><p className="text-sm font-semibold text-slate-900">{submission.user?.name ?? "Student"}</p><p className="mt-0.5 text-sm text-slate-500">{submission.user?.email ?? "Email unavailable"}</p></div></div></section>
        <div className="grid gap-3 sm:grid-cols-2">
          <LinkCard href={submission.repositoryUrl} icon={<Code2 className="size-4" />} label="Repository URL" tone="repository" />
          <LinkCard href={submission.liveUrl} icon={<ExternalLink className="size-4" />} label="Live project URL" tone="live" />
        </div>
        <div className="flex justify-end border-t border-slate-100 pt-4"><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Close</Button></div>
      </div>
    </DialogContent>
  </Dialog>;
}

function LinkCard({ href, icon, label, tone }: { href?: string | null; icon: React.ReactNode; label: string; tone: "repository" | "live" }) {
  const toneClasses = tone === "repository"
    ? { iconBg: "bg-indigo-50", icon: "text-indigo-700", arrow: "text-indigo-500" }
    : { iconBg: "bg-emerald-50", icon: "text-emerald-700", arrow: "text-emerald-600" };
  return href ? <a href={href} target="_blank" rel="noopener noreferrer" className="group flex min-h-16 min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"><span className="flex min-w-0 items-center gap-3"><span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${toneClasses.iconBg} ${toneClasses.icon} group-hover:bg-blue-100 group-hover:text-blue-700`}>{icon}</span><span className="min-w-0"><span className="block text-xs font-semibold text-slate-800">{label}</span><span className="mt-1 block truncate text-xs text-slate-500" title={href}>{href}</span></span></span><ExternalLink className={`size-4 shrink-0 ${toneClasses.arrow} group-hover:text-blue-700`} /></a> : <div className="flex min-h-16 items-center justify-between rounded-xl border border-dashed border-slate-200 px-3.5 text-sm text-slate-400"><span className="flex items-center gap-3"><span className={`flex size-9 items-center justify-center rounded-lg ${toneClasses.iconBg} ${toneClasses.icon}`}>{icon}</span>{label}</span><span className="text-xs">Not provided</span></div>;
}
