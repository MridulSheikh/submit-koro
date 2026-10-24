import { UserRoleResult } from "../user/user.type";

export type SubmissionStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "REVIEWED"
  | "APPROVED"
  | "REJECTED";

export type Submission = {
  id: string;
  projectName: string;
  description: string | null;
  liveUrl: string;
  status: SubmissionStatus;
  repositoryUrl: string;

  createdAt: Date;
  updatedAt: Date;

  userId: string;
  user?: UserRoleResult
};

export type CreateSubmissionInput = {
  projectName: string;
  description?: string | null;
  liveUrl: string;
  repositoryUrl: string;
};

export type UpdateSubmissionInput = Partial<CreateSubmissionInput> & {
  status?: SubmissionStatus;
};
