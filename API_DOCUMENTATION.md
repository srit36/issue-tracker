# API Documentation

**Base URL (production):** `https://issue-tracker-payr.onrender.com`
**Base URL (local):** `http://localhost:5000`

All request and response bodies are JSON. All endpoints are prefixed under `/issues`.

---

## `POST /issues`

Creates a new issue.

**Request body:**
```json
{
  "title": "Login button not working on Safari",
  "description": "Users report the login button does nothing when clicked.",
  "priority": "High"
}
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `title` | String | Yes | — |
| `description` | String | No | Defaults to `""` |
| `priority` | String | No | One of `Low`, `Medium`, `High`, `Critical`. Defaults to `Medium` |
| `status` | String | No | One of `Open`, `In Progress`, `Closed`. Defaults to `Open` |

**Success response — `201 Created`:**
```json
{
  "_id": "66f8a2b91c...",
  "title": "Login button not working on Safari",
  "description": "Users report the login button does nothing when clicked.",
  "status": "Open",
  "priority": "High",
  "createdAt": "2026-09-07T19:39:00.820Z",
  "updatedAt": "2026-09-07T19:39:00.820Z"
}
```

**Error response — `400 Bad Request`** (e.g. missing `title`):
```json
{ "error": "Issue validation failed: title: Path `title` is required." }
```

---

## `GET /issues`

Returns all issues, sorted by creation date (newest first).

**Success response — `200 OK`:**
```json
[
  {
    "_id": "66f8a2b91c...",
    "title": "Login button not working on Safari",
    "description": "...",
    "status": "Open",
    "priority": "High",
    "createdAt": "2026-09-07T19:39:00.820Z",
    "updatedAt": "2026-09-07T19:39:00.820Z"
  }
]
```

**Error response — `500 Internal Server Error`** (unexpected server/database failure).

---

## `PUT /issues/:id`

Updates a specific issue by its ID. Any subset of fields may be sent — only the included fields are changed.

**Request body (example):**
```json
{ "status": "In Progress" }
```

**Success response — `200 OK`:** the full updated issue document.

**Error response — `404 Not Found`** (no issue with that ID exists):
```json
{ "error": "Issue not found" }
```

**Error response — `400 Bad Request`** (invalid field value, e.g. an unrecognized status).

---

## `DELETE /issues/:id`

Deletes a specific issue by its ID.

**Success response — `200 OK`:**
```json
{ "message": "Issue deleted successfully" }
```

**Error response — `404 Not Found`:**
```json
{ "error": "Issue not found" }
```

---

## Status code summary

| Code | Meaning | Used when |
|---|---|---|
| `200` | OK | Successful GET, PUT, or DELETE |
| `201` | Created | Successful POST |
| `400` | Bad Request | Client sent invalid or incomplete data |
| `404` | Not Found | Requested issue ID does not exist |
| `500` | Internal Server Error | Unexpected server-side failure (e.g. database unreachable) |
