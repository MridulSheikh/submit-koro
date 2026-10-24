export type SubmissionStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "REVIEWED"
  | "APPROVED"
  | "REJECTED";

export type Submission = {
  id: string;
  projectName: string;
  description?: string | null;
  liveUrl?: string | null;
  repositoryUrl?: string | null;
  status: SubmissionStatus;
  createdAt: string;
  reviews?: SubmissionReview[];
};

export type SubmissionReview = {
  id: string;
  score?: number | null;
  feedback: string;
  createdAt: string;
  reviewer?: { id: string; name: string } | null;
};
