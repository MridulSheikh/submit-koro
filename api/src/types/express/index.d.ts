
export type OverviewPermission = "NO_ACCESS" | "VIEW";

export type ReviewPermission = "NO_ACCESS" | "VIEW" | "REVIEW";

export type SubmissionPermission = "NO_ACCESS" | "VIEW" | "SUBMIT";

export type TeamPermission = "NO_ACCESS" | "VIEW" | "MANAGE";

export interface Role {
  name: string;
  key: string;
  overviewPermission: OverviewPermission;
  reviewPermission: ReviewPermission;
  submissionPermission: SubmissionPermission;
  teamPermission: TeamPermission;
}


declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
        role: Role | null;
        emailVerified: boolean;
      };
    }
  }
}

export {};
