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

### GET /profile ⏳
- **Description**: Retrieve current user profile and associated roles
- **Response**: `{ user: User, globalRole: string, caseRoles: CaseRole[] }`
- **Status Codes**: 200 (success), 401 (unauthorized)
- **Authentication**: Required

### PUT /profile ⏳
- **Description**: Update user profile information and settings
- **Body**: `{ name?: string, email?: string, preferences?: object }`
- **Response**: `{ user: User }`
- **Status Codes**: 200 (success), 400 (validation error), 401 (unauthorized)
- **Authentication**: Required

## Case Management Routes

### POST /cases/:caseId/invitations ⏳
- **Description**: Send case invitation email to specified user
- **Parameters**: `caseId: number`
- **Body**: `{ email: string, roleId: number, message?: string }`
- **Response**: `{ invitation: Invitation }`
- **Status Codes**: 200 (success), 400 (validation error), 403 (unauthorized), 404 (case not found)
- **Authentication**: Required (case owner/admin)

### GET /cases/:caseId/invitations ⏳
- **Description**: List all pending invitations for a case
- **Parameters**: `caseId: number`
- **Response**: `{ invitations: Invitation[] }`
- **Status Codes**: 200 (success), 403 (unauthorized), 404 (case not found)
- **Authentication**: Required (case owner/admin)

### DELETE /cases/:caseId/invitations/:invitationId ⏳
- **Description**: Cancel a pending case invitation
- **Parameters**: `caseId: number, invitationId: number`
- **Response**: `{ message: string }`
- **Status Codes**: 200 (success), 403 (unauthorized), 404 (invitation not found)
- **Authentication**: Required (case owner/admin)

### POST /invitations/:token/accept ⏳
- **Description**: Accept case invitation using token from email
- **Parameters**: `token: string`
- **Response**: `{ caseRole: UserCaseRole }`
- **Status Codes**: 200 (success), 400 (expired/invalid token), 404 (invitation not found)
- **Authentication**: Required

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
- Future: General API rate limiting (100 requests/minute per user)