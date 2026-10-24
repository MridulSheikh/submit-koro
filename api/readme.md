# Submit Koro API

API reference for the Express API. Unless otherwise noted, endpoints use the
`/api` prefix and return JSON.

## Base URL and authentication

The local API base URL is `http://localhost:8000`. Set `PORT`, `CLIENT_URL`,
`DATABASE_URL`, and `REDIS_URL` in `api/.env`. Profile image upload also
requires `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and
`CLOUDINARY_API_SECRET`. For Cloudinary accounts hosted in a regional data
center, set `CLOUDINARY_UPLOAD_PREFIX` to the API endpoint provided by
Cloudinary (for example, `https://api-eu.cloudinary.com`). Keep the API secret
private and never commit `.env`.

Protected endpoints use the Better Auth session cookie. Sign in through the
Better Auth endpoints and send the cookie with subsequent requests. For browser
clients, use `credentials: "include"` and configure the API origin.

Better Auth endpoints are proxied under `/api/auth/*`. Common email/password
endpoints include:

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/sign-up/email` | Create an account |
| `POST` | `/api/auth/sign-in/email` | Sign in |
| `POST` | `/api/auth/sign-out` | Sign out |
| `GET` | `/api/auth/get-session` | Get the current session |

Email verification is required for protected API routes.

## Common response formats

Successful application API endpoints return HTTP `200` by default (`201` when
creating a role) and a JSON object with `success`, `statusCode`, `message`, and
`data`. Fields that do not apply to a particular response, such as `meta`, are
omitted.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Successfully retrieved submissions",
  "meta": { "page": 1, "limit": 10, "total": 25 },
  "data": []
}
```

For list endpoints, `meta.total` is the total matching record count before
pagination, `meta.page` is the current 1-based page, and `meta.limit` is the
requested page size. An empty result is returned as `"data": []`; it is not an
error.

### Error responses

Application API errors use this JSON shape:

```json
{
  "success": false,
  "message": "Something went wrong!",
  "errorMessage": "Submission not found",
  "errorDetails": {
    "message": "Submission not found"
  },
  "stack": "..."
}
```

`errorMessage` describes the failure. `message` is the global handler's
category-level message and may be generic for application errors. `stack` is
currently included by the global error handler; clients should not depend on
it, and production deployments should avoid exposing stack traces.

Common application and database errors:

| HTTP status | Situation | Response details |
| --- | --- | --- |
| `400` | Invalid/missing resource ID or malformed request, when explicitly checked | `errorMessage` explains the problem |
| `401` | No valid session or email verification required | Authentication error |
| `403` | Missing permission, modifying a protected role, or deleting someone else's submission | Authorization error |
| `404` | Requested record does not exist | Prisma `P2025` is normalized to `Record Not Found` |
| `409` | Duplicate unique value, foreign-key conflict, or deleting a role assigned to users | `errorDetails` identifies the database conflict |
| `429` | Auth or submission request limit exceeded | Retry after the duration in the `Retry-After` header |
| `500` | Unexpected server/database error; **validation errors currently also use this status** | Inspect `message`, `errorMessage`, and `errorDetails` |

Validation failures use `message: "Validation Error"` and put Zod's issues in
`errorDetails.issues`. Each issue contains a `path`, a validation `code`, and a
human-readable `message`. Example:

```json
{
  "success": false,
  "message": "Validation Error",
  "errorMessage": "projectname is project name is required.",
  "errorDetails": {
    "issues": [
      {
        "code": "too_small",
        "path": ["body", "projectName"],
        "message": "Project name is required"
      }
    ],
    "name": "ZodError"
  },
  "stack": "..."
}
```

The current Zod error handler assigns HTTP `500` to validation failures even
though the response message identifies a client input error. Better Auth
endpoints under `/api/auth/*` are handled by Better Auth directly, so their
error response shape may differ from the application API shape above.

### Rate-limit response

Auth and submission endpoints each allow 100 requests per IP per 15-minute
window. Their counters are separate. Requests over the limit return HTTP `429`
and include `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`, and
`Retry-After` headers.

```json
{
  "success": false,
  "message": "Something went wrong!",
  "errorMessage": "Too many requests. Please try again later.",
  "errorDetails": {
    "message": "Too many requests. Please try again later."
  },
  "stack": "..."
}
```

## Users

| Method | Endpoint | Permission | Description |
| --- | --- | --- | --- |
| `GET` | `/api/users` | `teamPermission: VIEW` or `MANAGE` | List and filter team users |
| `POST` | `/api/users/logout` | Signed in | Revoke the current session and clear its cookie |
| `GET` | `/api/users/me` | Signed in | Get the current user profile and role permissions |
| `PATCH` | `/api/users/me` | Signed in | Update the current user's profile |
| `POST` | `/api/users/me/image` | Signed in | Upload a profile image |
| `PATCH` | `/api/users/me/password` | Signed in | Change the current user's password |
| `PATCH` | `/api/users/:userId/role` | `teamPermission: MANAGE` | Assign a role to another user |

`GET /api/users` accepts `search` (matches name and email), `status` (`ACTIVE`
or `INACTIVE`), `roleKey`, `sort` (`createdAt`, `name`, `email`, or `status`,
with `-` for descending order), `page`, and `limit` (1–100). Defaults are page
1, limit 10, and newest first. The response includes pagination metadata and
only public profile, role, verification, creation date, and submission-count
fields; credentials and sessions are excluded.

### Update profile

`PATCH /api/users/me`

At least one field is required. Only `name` and `image` are accepted.
Send `Content-Type: application/json` and the Better Auth session cookie.

```json
{
  "name": "New Name",
  "image": "https://example.com/avatar.png"
}
```

Set `image` to `null` to remove the profile image.

### Upload profile image

`POST /api/users/me/image`

Send a `multipart/form-data` request with the file in the `image` field.
JPEG, PNG, and WebP files up to 5 MB are accepted. The API uploads the image to
Cloudinary and returns its secure URL; use that URL in `PATCH /api/users/me` to
save it to the profile.

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile image uploaded successfully",
  "data": {
    "image": "https://res.cloudinary.com/example/image/upload/profile.png"
  }
}
```

Successful response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": {
    "id": "user-id",
    "name": "New Name",
    "image": "https://example.com/avatar.png",
    "email": "user@example.com",
    "role": {}
  }
}
```

Invalid URLs, unsupported fields, or an empty body fail validation.

### Change password

`PATCH /api/users/me/password`

The current password must be correct. The new password must be 8–128 characters
and differ from the current password. Other sessions are revoked after the
password is changed.

```json
{
  "currentPassword": "current-password",
  "newPassword": "new-secure-password"
}
```

Successful response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password updated successfully",
  "data": null
}
```

An incorrect current password is rejected by Better Auth. Validation rejects
missing passwords, a new password shorter than 8 or longer than 128 characters,
or a new password identical to the current password.

### Assign a role

`PATCH /api/users/:userId/role`

```json
{
  "roleKey": "MENTOR"
}
```

Users cannot change their own role, and the last admin role cannot be removed.
On success, `data` contains the updated user profile and role. A missing user or
role returns `404`; attempts to change one's own role or demote the last admin
return `403` or `409`, respectively.

## Submissions

All `/api/submission/*` endpoints are rate-limited to 100 requests per IP per
15-minute window. They require a verified Better Auth session.

| Method | Endpoint | Permission | Description |
| --- | --- | --- | --- |
| `GET` | `/api/submission` | `submissionPermission: SUBMIT` or `VIEW` | List submissions |
| `POST` | `/api/submission` | `submissionPermission: SUBMIT` | Create a submission |
| `GET` | `/api/submission/:id` | `submissionPermission: SUBMIT` or `VIEW` | Get one submission |
| `PATCH` | `/api/submission/:id` | `submissionPermission: SUBMIT`; `REVIEW` also required to change status | Update a submission |
| `DELETE` | `/api/submission/:id` | `submissionPermission: SUBMIT`; only the owner can delete | Delete a submission |
| `GET` | `/api/submission/user/:userId` | `submissionPermission: SUBMIT` or `VIEW` | List a user's submissions |

List endpoints accept these query parameters:

| Parameter | Description |
| --- | --- |
| `search` | Search project name, description, live URL, or repository URL |
| `status` | Filter by `PENDING`, `IN_REVIEW`, `REVIEWED`, `APPROVED`, or `REJECTED` |
| `sort` | Sort by `createdAt`, `projectName`, or `status`; prefix a field with `-` for descending order |
| `page` | Page number, defaults to `1` |
| `limit` | Results per page, from `1` to `100`, defaults to `10` |

Example request:

```http
GET /api/submission?status=PENDING&sort=-createdAt&page=1&limit=10
```

Successful list response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Successfully retrived submissions",
  "meta": { "page": 1, "limit": 10, "total": 1 },
  "data": [
    {
      "id": "submission-uuid",
      "projectName": "Portfolio",
      "status": "PENDING",
      "createdAt": "2026-10-24T10:00:00.000Z"
    }
  ]
}
```

Create body:

```json
{
  "projectName": "Portfolio",
  "description": "Personal portfolio website",
  "liveUrl": "https://portfolio.example.com",
  "repositoryUrl": "https://github.com/example/portfolio"
}
```

`description` is optional and may be `null`. Update accepts any non-empty
subset of `projectName`, `description`, `liveUrl`, `repositoryUrl`, and `status`.
Only users with the `REVIEW` permission may change `status`.

Example update request:

```json
{
  "status": "APPROVED"
}
```

Successful create, update, get, and delete responses place the affected
submission object in `data`. Invalid status, URL, sort field, page, or limit
fails validation. Deleting a submission owned by another user returns `403`;
an unknown submission returns `404`.

## Reviews

| Method | Endpoint | Permission | Description |
| --- | --- | --- | --- |
| `POST` | `/api/review` | `reviewPermission: REVIEW` | Create a review |
| `PATCH` | `/api/review/:id` | `reviewPermission: REVIEW` | Update a review |
| `DELETE` | `/api/review/:id` | `reviewPermission: REVIEW` | Delete a review |
| `GET` | `/api/review/submission/:submissionId` | `reviewPermission: VIEW` or `REVIEW` | Get reviews for a submission |
| `GET` | `/api/review/reviewer/:id` | `reviewPermission: VIEW` or `REVIEW` | Get reviews by reviewer ID |

Create body:

```json
{
  "submissionId": "submission-uuid",
  "reviewerId": "reviewer-uuid",
  "score": 8.5,
  "feedback": "Clear and well-structured project."
}
```

`feedback` is required; `score` is optional and may be `null`. The authenticated
user must match `reviewerId`. Update accepts a non-empty subset of `score` and
`feedback`.

Successful create, update, delete, and get responses put the review or review
list in `data`. Invalid UUIDs or empty update bodies fail validation. Creating
a review for a non-existent submission/reviewer can return a foreign-key
conflict (`409`); a submission with no reviews currently returns `404`.

## Roles

| Method | Endpoint | Permission | Description |
| --- | --- | --- | --- |
| `GET` | `/api/roles` | `teamPermission: VIEW` or `MANAGE` | List roles |
| `POST` | `/api/roles` | `teamPermission: MANAGE` | Create a role |
| `GET` | `/api/roles/:id` | `teamPermission: VIEW` or `MANAGE` | Get a role |
| `PATCH` | `/api/roles/:id` | `teamPermission: MANAGE` | Update a role |
| `DELETE` | `/api/roles/:id` | `teamPermission: MANAGE` | Delete a role |

Create body (all permission fields are optional arrays):

```json
{
  "name": "Mentor",
  "key": "MENTOR",
  "overviewPermission": ["VIEW"],
  "reviewPermission": ["VIEW", "REVIEW"],
  "submissionPermission": ["VIEW"],
  "teamPermission": []
}
```

Permission values:

- `overviewPermission`: `NO_ACCESS`, `VIEW`
- `reviewPermission`: `NO_ACCESS`, `VIEW`, `REVIEW`
- `submissionPermission`: `NO_ACCESS`, `VIEW`, `SUBMIT`
- `teamPermission`: `NO_ACCESS`, `VIEW`, `MANAGE`

Updates accept a non-empty subset of the create fields. The `SUPER_ADMIN`
system role cannot be modified or deleted. Roles assigned to users cannot be
deleted.

Successful create, update, get, and delete responses return the role in `data`;
the role list endpoint returns an array. A duplicate role name or key returns
`409`. Updating/deleting `SUPER_ADMIN` returns `403`; deleting a role assigned
to a user returns `409`.

## Overview

| Method | Endpoint | Permission | Description |
| --- | --- | --- | --- |
| `GET` | `/api/overview` | `overviewPermission: VIEW` | Get dashboard statistics and the latest submissions |

Example data fields:

```json
{
  "totalSubmission": 42,
  "pendingReview": 8,
  "totalApproved": 12,
  "latestSubmissions": []
}
```

`latestSubmissions` contains up to 10 newest submissions. Overview data is
cached in Redis for 10 minutes.

Successful response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Overview retrieved successfully",
  "data": {
    "totalSubmission": 42,
    "pendingReview": 8,
    "totalApproved": 12,
    "latestSubmissions": [
      {
        "id": "submission-uuid",
        "projectName": "Portfolio",
        "status": "APPROVED",
        "createdAt": "2026-10-24T10:00:00.000Z",
        "user": { "id": "user-id", "name": "Example User" }
      }
    ]
  }
}
```

## Health check

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `GET` | `/health` | None | Check whether the API is running |
