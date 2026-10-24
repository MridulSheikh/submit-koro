import type { SubmissionStatus } from "@/components/submission/types";

const statusClasses: Record<SubmissionStatus, string> = {
  PENDING: "bg-amber-50 text-amber-800 ring-amber-200",
  IN_REVIEW: "bg-blue-50 text-blue-800 ring-blue-200",
  REVIEWED: "bg-violet-50 text-violet-800 ring-violet-200",
  APPROVED: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-800 ring-rose-200",
};

export default function SubmissionStatusBadge({ status }: { status: SubmissionStatus }) {
  return (
    <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses[status]}`}>
      {status.replaceAll("_", " ")}
    </span>
  );
}
