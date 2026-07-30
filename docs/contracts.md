# Nama Organisasi LMS API Contract

This reference mirrors the FastAPI routers audited on 2026-07-03. Runtime documentation is available at `/docs` and `/openapi.json` on the backend host.

## Conventions

- Base URL: `http://localhost:8001/api` in local development.
- JSON is used for normal request bodies and responses.
- Protected endpoints require `Authorization: Bearer <JWT>`.
- Error bodies normally use FastAPI's `{"detail":"message"}` shape.
- List endpoints typically wrap arrays in an object rather than returning a bare array.

## Roles

| Role | Access |
|---|---|
| Public | Health, registration, login, course list/detail, public user lookup |
| `student` | Enrollment, progress, quiz, discussion, certificate, profile |
| `instructor` | Authenticated features plus owned-course management |
| `admin` | Authenticated features plus user and statistics administration |

## Route inventory

### System

| Method | Path | Auth | Purpose |
|---|---|---|---|
| GET | `/` | No | API health/version response |

### Settings

| Method | Path | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/settings` | No | — | Read public runtime branding/settings |
| PUT | `/settings` | Admin | `{"organization_name":"Nama Organisasi"}` | Update runtime organization name |

The frontend uses `organization_name` for neutral branding in the navbar, authentication pages, and landing page. The default value is `Nama Organisasi`.

### Authentication

| Method | Path | Auth | Body | Purpose |
|---|---|---|---|---|
| POST | `/auth/register` | No | `UserCreate` | Create account and issue token |
| POST | `/auth/login` | No | `{email,password}` | Verify credentials and issue token |
| GET | `/auth/me` | User | — | Reload the current database user |

Registration body:

```json
{
  "name": "Example Student",
  "email": "student@example.com",
  "password": "strong-password",
  "role": "student",
  "avatar": null,
  "bio": "",
  "expertise": ""
}
```

Successful registration/login:

```json
{
  "success": true,
  "user": {"id":"uuid","name":"Example Student","email":"student@example.com","role":"student"},
  "token": "jwt"
}
```

### Courses

| Method | Path | Auth | Inputs | Purpose |
|---|---|---|---|---|
| GET | `/courses` | No | Query: `category`, `level`, `search` | Filter/list courses |
| GET | `/courses/{course_id}` | No | Path ID | Course with instructor details |
| POST | `/courses` | Instructor | `CourseCreate` JSON | Create an owned course |
| GET | `/courses/instructor/my-courses` | Instructor | — | List caller's courses |
| PUT | `/courses/{course_id}` | Instructor | Partial JSON fields | Update owned course |
| DELETE | `/courses/{course_id}` | Instructor | Path ID | Delete owned course |

Course creation requires `title`, `description`, `category`, `level`, and `duration`; optional values include `thumbnail`, `skills`, `long_description`, `language`, and `subtitles`. Supported levels are `Beginner`, `Intermediate`, and `Advanced`.

### Enrollments and progress

| Method | Path | Auth | Body | Purpose |
|---|---|---|---|---|
| POST | `/enrollments` | User | `{"course_id":"uuid"}` | Enroll once in a course |
| GET | `/enrollments` | User | — | List current user's enrollments with courses |
| GET | `/enrollments/{enrollment_id}` | User | — | Retrieve an owned enrollment |
| PUT | `/enrollments/{enrollment_id}/progress` | User | `{"lesson_id":"l1","completed":true}` | Toggle lesson completion and recalculate progress |
| GET | `/enrollments/course/{course_id}/check` | User | — | Check whether current user is enrolled |

Duplicate enrollment is rejected. Enrollment access is ownership-scoped.

### Quizzes

| Method | Path | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/quizzes/lesson/{lesson_id}` | User | — | Load a lesson quiz without answer leakage |
| POST | `/quizzes/{quiz_id}/submit` | User | `{"answers":{"question-id":1}}` | Score answers |

Quiz submission returns `score`, `total_questions`, `correct_answers`, and `passed`.

### Discussions

| Method | Path | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/discussions/course/{course_id}` | User | — | List course discussions |
| POST | `/discussions` | User | `{course_id,title,content,category}` | Create a post |
| PUT | `/discussions/{discussion_id}/like` | User | — | Increment likes |

### Certificates

| Method | Path | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/certificates` | User | — | List current user's certificates |
| POST | `/certificates/generate` | User | `{"course_id":"uuid"}` | Generate or return course certificate |
| GET | `/certificates/{certificate_id}` | User | — | Retrieve an owned certificate |

Generation validates enrollment/completion and prevents duplicate user-course certificates.

### Users

| Method | Path | Auth | Body | Purpose |
|---|---|---|---|---|
| GET | `/users/profile` | User | — | Current profile |
| PUT | `/users/profile` | User | Partial `{name,bio,expertise,avatar}` | Update profile |
| GET | `/users/{user_id}` | No | — | Public user fields |

### Administration

Every route below requires an `admin` token.

| Method | Path | Inputs | Purpose |
|---|---|---|---|
| GET | `/admin/users` | Query: `page=1`, `limit=10`, optional `role`, `search` | Paginated user list |
| GET | `/admin/users/{user_id}` | Path ID | User and enrollment details |
| PUT | `/admin/users/{user_id}/role` | Query: `new_role` | Change role |
| DELETE | `/admin/users/{user_id}` | Path ID | Delete user |
| POST | `/admin/users` | Query: `name`, `email`, `password`, `role` | Create user |
| GET | `/admin/stats` | — | User/course/enrollment totals |

## Status-code expectations

| Code | Meaning |
|---:|---|
| 200/201 | Successful read/write (specific decorators currently determine exact success code) |
| 400 | Duplicate or invalid business input |
| 401 | Missing/invalid/expired credentials |
| 403 | Authenticated but wrong role or ownership |
| 404 | Requested entity not found |
| 422 | Pydantic/query validation failure |
| 500 | Unexpected server/database failure |

## Compatibility rule

When changing an endpoint, update all three together: its backend router, `frontend/src/services/api.js`, and this file. Validate the generated OpenAPI document before release.
