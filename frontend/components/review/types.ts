export type ReviewSubmissionStatus = "PENDING" | "IN_REVIEW" | "REVIEWED" | "APPROVED" | "REJECTED";

export type SubmissionReview = {
  id: string;
  reviewerId?: string;
  feedback: string;
  score?: number | null;
  reviewer?: { name: string };
};

export type ReviewSubmission = {
  id: string;
  projectName: string;
  description?: string | null;
  liveUrl?: string | null;
  repositoryUrl?: string | null;
  status: ReviewSubmissionStatus;
  createdAt: string;
  user?: { id?: string; name: string; email: string };
  reviews?: SubmissionReview[];
};
