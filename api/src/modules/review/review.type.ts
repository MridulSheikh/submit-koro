import { Submission } from "../submission/submission.type"
import { UserRoleResult } from "../user/user.type"

export type TReview = {
    id?: string,
    score?: number,
    feedback: string,
    submissionId: string,
    submission?: Submission,
    reviewerId: string,
    reviewer?: UserRoleResult
}

export type TUpdateReview = {
    score?: number | null,
    feedback?: string
}