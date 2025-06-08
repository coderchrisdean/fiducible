# API Routes Documentation

## Authentication Routes

### POST /api/auth/signup
- **Description**: Register a new user account
- **Body**: `{ name: string, email: string, password: string }`
- **Response**: `{ user: User, message: string }`
- **Status Codes**: 200 (success), 400 (validation error), 409 (user exists)
- **Features**: 
  - Creates email verification token
  - Sends verification email via Resend
  - Returns user without password hash

### POST /api/auth/signin
- **Description**: Authenticate user login
- **Body**: `{ email: string, password: string }`
- **Response**: `{ user: User }`
- **Status Codes**: 200 (success), 401 (invalid credentials)

## Email Verification Routes

### GET /api/verify-email
- **Description**: Verify user email address using token
- **Query Parameters**: `token: string`
- **Response**: `{ message: string }`
- **Status Codes**: 
  - 200 (verified successfully)
  - 400 (invalid/expired token, already verified)
  - 404 (token not found)
- **Features**:
  - Validates token expiration (24 hours)
  - Marks user as email verified
  - Prevents duplicate verification

### POST /api/emails/resend
- **Description**: Resend email verification
- **Body**: `{ email: string }`
- **Response**: `{ message: string }`
- **Status Codes**: 
  - 200 (email sent)
  - 400 (already verified)
  - 404 (user not found)
  - 429 (rate limited - 60 seconds)
- **Features**:
  - Rate limiting (60 seconds between requests)
  - Replaces existing unverified tokens
  - Sends new verification email

## User Profile Routes

### GET /api/profile ✅
- **Description**: Retrieve current user profile and associated roles
- **Response**: `{ user: User, caseRoles: UserCaseRole[], cases: Case[] }`
- **Status Codes**: 200 (success), 401 (unauthorized), 404 (user not found)
- **Authentication**: Required
- **Features**: Returns user profile with case access and role information

### PUT /api/profile ✅
- **Description**: Update user profile information and settings
- **Body**: `{ name?: string, email?: string, globalRole?: string }`
- **Response**: `{ user: User }`
- **Status Codes**: 200 (success), 400 (validation error), 401 (unauthorized), 404 (user not found)
- **Authentication**: Required

## Case Management Routes

### POST /api/cases/:caseId/invitations ✅
- **Description**: Send case invitation email to specified user
- **Parameters**: `caseId: number`
- **Body**: `{ email: string, roleId: number, message?: string }`
- **Response**: `{ invitation: CaseInvitation }`
- **Status Codes**: 200 (success), 400 (validation error), 404 (case not found)
- **Authentication**: Required
- **Features**: Creates invitation token, sends email, validates role and case access

### GET /api/cases/:caseId/invitations ✅
- **Description**: List all pending invitations for a case
- **Parameters**: `caseId: number`
- **Response**: `{ invitations: CaseInvitation[] }`
- **Status Codes**: 200 (success), 400 (invalid case ID)
- **Authentication**: Required

### DELETE /api/cases/:caseId/invitations/:invitationId ✅
- **Description**: Cancel a pending case invitation
- **Parameters**: `caseId: number, invitationId: number`
- **Response**: `{ message: string }`
- **Status Codes**: 200 (success), 400 (invalid IDs), 404 (invitation not found)
- **Authentication**: Required

### POST /api/invitations/:token/accept ✅
- **Description**: Accept case invitation using token from email
- **Parameters**: `token: string`
- **Response**: `{ caseRole: UserCaseRole }`
- **Status Codes**: 200 (success), 400 (expired/invalid token, email mismatch), 404 (invitation not found)
- **Authentication**: Required
- **Features**: Validates token expiration, creates user case role, marks invitation as accepted

## Conservatee Routes

### GET /api/conservatees
- **Description**: Get all conservatees for authenticated user
- **Response**: `{ conservatees: Conservatee[] }`
- **Status Codes**: 200 (success), 401 (unauthorized)
- **Authentication**: Required

### POST /api/conservatees
- **Description**: Create new conservatee
- **Body**: `{ name: string, dob?: string, contactInfo?: string, caseNumber?: string, notes?: string }`
- **Response**: `{ conservatee: Conservatee }`
- **Status Codes**: 200 (success), 400 (validation error), 401 (unauthorized)
- **Authentication**: Required

### PUT /api/conservatees/:id
- **Description**: Update conservatee information
- **Parameters**: `id: number`
- **Body**: `{ name?: string, dob?: string, contactInfo?: string, caseNumber?: string, notes?: string }`
- **Response**: `{ conservatee: Conservatee }`
- **Status Codes**: 200 (success), 400 (validation error), 401 (unauthorized), 404 (not found)
- **Authentication**: Required

### DELETE /api/conservatees/:id
- **Description**: Delete conservatee
- **Parameters**: `id: number`
- **Response**: `{ message: string }`
- **Status Codes**: 200 (success), 401 (unauthorized), 404 (not found)
- **Authentication**: Required

## Time Entry Routes

### GET /api/time-entries
- **Description**: Get all time entries for authenticated user
- **Response**: `{ timeEntries: TimeEntry[] }`
- **Status Codes**: 200 (success), 401 (unauthorized)
- **Authentication**: Required

### POST /api/time-entries
- **Description**: Create new time entry
- **Body**: `{ conservateeId?: number, date: string, taskDescription: string, memo?: string, timeSpent: string }`
- **Response**: `{ timeEntry: TimeEntry }`
- **Status Codes**: 200 (success), 400 (validation error), 401 (unauthorized)
- **Authentication**: Required

### PUT /api/time-entries/:id
- **Description**: Update time entry
- **Parameters**: `id: number`
- **Body**: `{ conservateeId?: number, date?: string, taskDescription?: string, memo?: string, timeSpent?: string }`
- **Response**: `{ timeEntry: TimeEntry }`
- **Status Codes**: 200 (success), 400 (validation error), 401 (unauthorized), 404 (not found)
- **Authentication**: Required

### DELETE /api/time-entries/:id
- **Description**: Delete time entry
- **Parameters**: `id: number`
- **Response**: `{ message: string }`
- **Status Codes**: 200 (success), 401 (unauthorized), 404 (not found)
- **Authentication**: Required

## Document Management Routes ⏳

### Document Upload
**POST /api/cases/:caseId/documents/upload ⏳**
- **Description**: Upload document(s) to a specific case with metadata
- **Parameters**: `caseId: number`
- **Body**: `FormData` with files and metadata
- **Payload**: 
  ```typescript
  {
    files: File[], // Multiple files supported
    folderId?: number,
    tags?: string[], // Tag names to create/assign
    description?: string
  }
  ```
- **Response**: 
  ```typescript
  {
    documents: Document[],
    message: string
  }
  ```
- **Status Codes**: 200 (success), 400 (validation error), 413 (file too large), 415 (unsupported type)
- **Authentication**: Required
- **Features**: File validation, text extraction, thumbnail generation, access control

### Document Listing & Filtering
**GET /api/cases/:caseId/documents ⏳**
- **Description**: List documents in a case with filtering and pagination
- **Parameters**: `caseId: number`
- **Query Parameters**:
  ```typescript
  {
    folderId?: number,
    tags?: string[], // Filter by tag names
    search?: string,
    page?: number,
    limit?: number,
    sortBy?: "name" | "date" | "size" | "downloads",
    sortOrder?: "asc" | "desc",
    archived?: boolean
  }
  ```
- **Response**:
  ```typescript
  {
    documents: Document[],
    totalCount: number,
    page: number,
    totalPages: number,
    folders: DocumentFolder[],
    tags: DocumentTag[]
  }
  ```
- **Status Codes**: 200 (success), 400 (invalid parameters), 403 (no case access)
- **Authentication**: Required

### Document Download
**GET /api/documents/:id/download ⏳**
- **Description**: Download document with access logging and audit trail
- **Parameters**: `id: number`
- **Response**: File stream with Content-Disposition headers
- **Status Codes**: 200 (success), 403 (no access), 404 (not found)
- **Authentication**: Required
- **Features**: Access validation, download counting, audit logging

### Document Search
**GET /api/cases/:caseId/documents/search ⏳**
- **Description**: Full-text search across documents using PostgreSQL TSVector
- **Parameters**: `caseId: number`
- **Query Parameters**:
  ```typescript
  {
    q: string, // Search query
    tags?: string[],
    folderId?: number,
    page?: number,
    limit?: number
  }
  ```
- **Response**:
  ```typescript
  {
    documents: Document[],
    totalCount: number,
    searchTime: number, // milliseconds
    suggestions?: string[] // Search suggestions
  }
  ```
- **Status Codes**: 200 (success), 400 (invalid query)
- **Authentication**: Required

### Document Operations
**PUT /api/documents/:id ⏳**
- **Description**: Update document metadata and properties
- **Parameters**: `id: number`
- **Body**: `{ title?: string, description?: string, folderId?: number }`
- **Response**: `{ document: Document }`
- **Status Codes**: 200 (success), 400 (validation error), 403 (no access), 404 (not found)
- **Authentication**: Required

**DELETE /api/documents/:id ⏳**
- **Description**: Archive or permanently delete document
- **Parameters**: `id: number`
- **Query Parameters**: `{ permanent?: boolean }`
- **Response**: `{ message: string }`
- **Status Codes**: 200 (success), 403 (no access), 404 (not found)
- **Authentication**: Required

### Folder Management Routes

**POST /api/cases/:caseId/folders ⏳**
- **Description**: Create new document folder within case
- **Parameters**: `caseId: number`
- **Body**: `{ name: string, parentId?: number }`
- **Response**: `{ folder: DocumentFolder }`
- **Status Codes**: 200 (success), 400 (validation error), 403 (no case access)
- **Authentication**: Required

**GET /api/cases/:caseId/folders ⏳**
- **Description**: List folder hierarchy for case
- **Parameters**: `caseId: number`
- **Response**: `{ folders: DocumentFolder[] }`
- **Status Codes**: 200 (success), 403 (no case access)
- **Authentication**: Required

**PUT /api/folders/:id ⏳**
- **Description**: Update folder name or move to different parent
- **Parameters**: `id: number`
- **Body**: `{ name?: string, parentId?: number }`
- **Response**: `{ folder: DocumentFolder }`
- **Status Codes**: 200 (success), 400 (validation error), 403 (no access), 404 (not found)
- **Authentication**: Required

**DELETE /api/folders/:id ⏳**
- **Description**: Delete empty folder (must contain no documents or subfolders)
- **Parameters**: `id: number`
- **Response**: `{ message: string }`
- **Status Codes**: 200 (success), 400 (folder not empty), 403 (no access), 404 (not found)
- **Authentication**: Required

### Tag Management Routes

**POST /api/cases/:caseId/tags ⏳**
- **Description**: Create new document tag for case
- **Parameters**: `caseId: number`
- **Body**: `{ name: string, color?: string }`
- **Response**: `{ tag: DocumentTag }`
- **Status Codes**: 200 (success), 400 (validation error), 403 (no case access), 409 (tag exists)
- **Authentication**: Required

**GET /api/cases/:caseId/tags ⏳**
- **Description**: List all document tags for case
- **Parameters**: `caseId: number`
- **Response**: `{ tags: DocumentTag[] }`
- **Status Codes**: 200 (success), 403 (no case access)
- **Authentication**: Required

**PUT /api/tags/:id ⏳**
- **Description**: Update tag name or color
- **Parameters**: `id: number`
- **Body**: `{ name?: string, color?: string }`
- **Response**: `{ tag: DocumentTag }`
- **Status Codes**: 200 (success), 400 (validation error), 403 (no access), 404 (not found)
- **Authentication**: Required

**DELETE /api/tags/:id ⏳**
- **Description**: Delete tag and remove from all documents
- **Parameters**: `id: number`
- **Response**: `{ message: string }`
- **Status Codes**: 200 (success), 403 (no access), 404 (not found)
- **Authentication**: Required

### Document Tag Relations

**POST /api/documents/:id/tags ⏳**
- **Description**: Add multiple tags to document
- **Parameters**: `id: number`
- **Body**: `{ tagIds: number[] }`
- **Response**: `{ document: Document, tags: DocumentTag[] }`
- **Status Codes**: 200 (success), 400 (invalid tag IDs), 403 (no document access), 404 (not found)
- **Authentication**: Required

**DELETE /api/documents/:id/tags/:tagId ⏳**
- **Description**: Remove specific tag from document
- **Parameters**: `id: number, tagId: number`
- **Response**: `{ message: string }`
- **Status Codes**: 200 (success), 403 (no access), 404 (document or tag not found)
- **Authentication**: Required

## Route Status Legend
- ✅ Implemented
- ⏳ Planned
- 🔄 In Progress

## Authentication
All protected routes require authentication via session cookies or Authorization header.
Unauthorized requests return 401 status with `{ message: "Unauthorized" }`.

## Error Handling
All routes return consistent error responses:
```json
{
  "message": "Error description",
  "code": "ERROR_CODE" // Optional
}
```

## Rate Limiting
- Email resend: 1 request per 60 seconds per email
- Document upload: 50 requests per hour per user
- Future: General API rate limiting (100 requests/minute per user)

## File Upload Specifications
- **Maximum file size**: 10MB per file
- **Allowed file types**: PDF, DOC, DOCX, TXT, JPG, JPEG, PNG, GIF
- **Multiple file upload**: Supported via FormData
- **Storage options**: Local filesystem or AWS S3 (configurable)
- **Security**: File type validation, virus scanning (planned)

## Document Access Control
- Documents are case-scoped and inherit case permissions
- Users must have appropriate role in case to access documents
- Download actions are logged for audit trails
- Folder and tag access follows case permissions