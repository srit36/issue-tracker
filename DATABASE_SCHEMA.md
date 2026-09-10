# Database Schema

**Database:** MongoDB (hosted on MongoDB Atlas)
**Database name:** `issuetracker`
**Collection:** `issues`

## `Issue` document

| Field | Type | Required | Default | Notes |
|---|---|---|---|---|
| `_id` | ObjectId | Auto-generated | — | MongoDB's unique identifier for the document |
| `title` | String | Yes | — | The issue's title |
| `description` | String | No | `""` | Longer text description of the issue |
| `status` | String | No | `"Open"` | Restricted to: `Open`, `In Progress`, `Closed` |
| `priority` | String | No | `"Medium"` | Restricted to: `Low`, `Medium`, `High`, `Critical` |
| `createdAt` | Date | Auto-generated | — | Set once, when the document is first created |
| `updatedAt` | Date | Auto-generated | — | Automatically refreshed on every update |
| `__v` | Number | Auto-generated | `0` | Mongoose's internal document version key |

## Example document

```json
{
  "_id": "66f8a2b91c4e2a1234567890",
  "title": "Fix login bug",
  "description": "Users are unable to log in with correct credentials.",
  "status": "Open",
  "priority": "High",
  "createdAt": "2026-08-02T12:15:00.000Z",
  "updatedAt": "2026-08-02T12:15:00.000Z",
  "__v": 0
}
```

## Validation

Validation is enforced at the application layer using a Mongoose schema (`backend/models/Issue.js`), not by MongoDB itself, since MongoDB is schema-less by default. This ensures:

- Every issue has a non-empty `title`
- `status` and `priority` can never contain a value outside their defined sets (preventing typos or invalid states)
- `createdAt` / `updatedAt` are managed automatically and consistently, without manual date-handling code

## Why MongoDB

MongoDB's document model was chosen because:

- Each issue is a self-contained record with no relationships to other collections, making a document store a natural fit
- Documents map directly to JavaScript objects, requiring no translation layer between the database, the Node.js backend, and the JSON sent to/from the React frontend
- MongoDB Atlas provides a genuinely cloud-hosted, managed database with a generous permanent free tier, satisfying the project's cloud-hosted database requirement without any self-managed infrastructure
