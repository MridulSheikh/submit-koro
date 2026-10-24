export type ChangeUserRoleInput = {
  roleKey: string;
  id: string
};


export type OverviewPermission = "VIEW";

export type ReviewPermission = "VIEW" | "REVIEW";

export type SubmissionPermission = "VIEW" | "SUBMIT";

export type TeamPermission = "VIEW" | "MANAGE";

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
