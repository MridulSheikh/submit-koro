export type ChangeUserRoleInput = {
  roleKey: string;
  id: string
};


export type OverviewPermission = "NO_ACCESS" | "VIEW";

export type ReviewPermission = "NO_ACCESS" | "VIEW" | "REVIEW";

export type SubmissionPermission = "NO_ACCESS" | "VIEW" | "SUBMIT";

export type TeamPermission = "NO_ACCESS" | "VIEW" | "MANAGE";

export interface TRole {
  name: string;
  key: string;
  overviewPermission: OverviewPermission[];
  reviewPermission: ReviewPermission[];
  submissionPermission: SubmissionPermission[];
  teamPermission: TeamPermission[];
}

export type UserRoleResult = {
  id: string;
  name: string;
  email: string;
  role: {
    id: string;
    key: string;
    name: string;
  } | null;
};
