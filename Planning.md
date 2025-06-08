# Planning.md

## Project Overview

**App:** Fiducible
**Purpose:** Track every aspect of managing a conservatorship, with daily feature rollouts.

## Core Features

1. **Landing Page**

   * Responsive hero section
   * Brief app description and call-to-action buttons (Sign Up / Login)
   * Footer with links: Privacy Policy, Terms of Service, Contact

2. **Front-End Setup**

   * **Framework:** React (via Vite or CRA)
   * **Styling:** Tailwind CSS (or your preferred utility framework)
   * **Routing:** React Router
   * **State Management:** Context API or Zustand (for global auth + settings)

3. **Back-End Setup**

   * **Runtime:** Node.js
   * **Framework:** Express.js or Next.js API Routes
   * **Authentication:**

     * Google OAuth 2.0
     * Email/Password (bcrypt + JWT)
   * **ORM:** Prisma (with PostgreSQL)
   * **Environment Variables:**

     * DATABASE\_URL
     * JWT\_SECRET
     * GOOGLE\_CLIENT\_ID & GOOGLE\_CLIENT\_SECRET

4. **Database Schema (PostgreSQL)**

   * **User** (`Conservator`)

     * id, name, email, role, passwordHash, oauthProvider, createdAt
   * **Conservatee**

     * id, conservatorId, name, dob, contactInfo, caseNumber, notes, createdAt
   * **TimeEntry**

     * id, conservatorId, date, taskDescription, memo, timeSpent (decimal hours), createdAt
   * **Additional Entities** (future features)

     * Documents, Tasks, FinancialEntries, VisitLogs, Medications, AuditLogs

5. **Authentication Flow**

   * Public routes: `/`, `/login`, `/signup`
   * Protected routes: `/dashboard`, `/time-tracking`, `/conservatees/*`
   * Session management via HTTP-only cookies or JWT in Authorization header

6. **Dashboard**

   * Summary widgets:

     * Upcoming tasks
     * Recent time entries
     * Quick-add buttons (New Time Entry, New Conservatee)
   * Navigation sidebar

7. **Time-Tracking Functionality**

   * **Create Entry**:

     * **Date Picker** component
     * **Task Description** text input
     * **Memo** textarea
     * **Time Spent** numeric input with minimum 6 minutes (0.1h increments)
   * **List & Edit**:

     * Table or cards of past entries
     * Inline edit or modal
   * **Totals**:

     * Daily and weekly summaries

8. **Email Verification & Resend**

   * **Resend API Integration**:
     * Configure Resend service for transactional emails
     * Environment variables: RESEND_API_KEY, FROM_EMAIL
     * Email templates for verification and invitations
   * **EmailVerification Table Schema**:
     * id, userId, token, expiresAt, verified, createdAt
     * One-to-one relationship with User table
   * **Verification Flow**:
     * Send verification email on signup
     * Email contains verification link with token
     * Token validation and account activation
   * **Front-end "Resend Email" Button**:
     * Display on unverified account dashboard
     * Rate limiting (1 resend per 60 seconds)
     * Success/error toast notifications
     * Automatic hide after successful verification

9. **User Profiles & Roles**

   * **Global Role System**:
     * `globalRole` field on User table (admin, conservator, attorney, observer)
     * Global permissions for system-wide features
     * Admin role for user management and system settings
   * **Case-Based Role System**:
     * **Case Table**: id, name, description, status, createdBy, createdAt
     * **CaseRole Table**: id, name, permissions (JSON), description
     * **UserCaseRole Table**: id, userId, caseId, roleId, invitedBy, acceptedAt
   * **API Endpoints**:
     * `GET /profile` - Retrieve current user profile and roles
     * `PUT /profile` - Update user profile information
     * `POST /cases/:caseId/invitations` - Send case invitation to user
     * `GET /cases/:caseId/invitations` - List pending invitations for case
     * `DELETE /cases/:caseId/invitations/:invitationId` - Cancel invitation
     * `POST /invitations/:token/accept` - Accept case invitation
   * **Front-end UI Components**:
     * Profile page with role display and edit capabilities
     * Case invitation modal with email input and role selection
     * Role-based navigation and feature visibility
     * Invitation management interface for case owners
     * Scoped views based on user's role within each case

## Daily Feature Rollout Guidelines

* **Feature Backlog**: Maintain `FEATURES.md` for upcoming items.
* **Branch Strategy**: Create a new branch per feature (e.g., `feature/time-entry`).
* **Checkpoint Frequency**: Limit to 1–2 checkpoints per feature chunk.
* **Review Process**: Use the Assistant for small tweaks; Agent only for larger implementations.

## Folder Structure

```
/src
  /components     # Reusable UI components
  /pages          # Page-level views (Dashboard, Login, Signup)
  /services       # API client and auth logic
  /hooks          # Custom React hooks
  /styles         # Tailwind config & global styles
  /utils          # Helper functions (e.g., time rounding)
/server
  /controllers    # Express route handlers
  /models         # Prisma schema & types
  /routes         # API route definitions
  /middleware     # Auth, error handling
  /config         # Env variables loader
/prisma
  schema.prisma
/public           # Static assets
```

## Initial Checkpoints

1. **Repo Initialization**

   * Create Replit project
   * Initialize Git repo, install React + Express
   * Configure Tailwind and Prisma CLI
2. **Auth Module**

   * Set up Google OAuth + email/password
   * Build login/signup pages
3. **Database Migrations**

   * Define Prisma schema
   * Run initial migration
4. **Landing & Dashboard Layout**

   * Scaffold static Landing page
   * Create Dashboard shell
5. **Time-Tracking MVP**

   * Build TimeEntry form and listing
   * Implement time snapping utility

## Documentation Updates

### FEATURES.md Backlog Items

* **Email Verification & Resend**
  - Priority 2: Core Features
  - Resend API integration for transactional emails
  - Email verification flow with token-based validation
  - Front-end resend functionality with rate limiting
  - Estimated effort: 6-8 hours

* **User Profiles & Invitations**
  - Priority 2: Core Features  
  - Global role system (admin, conservator, attorney, observer)
  - Case-based role management with granular permissions
  - Invitation system for case collaboration
  - Profile management interface
  - Estimated effort: 12-15 hours

### ROUTES.md New Endpoints

* `GET /profile` - Retrieve current user profile and associated roles
* `PUT /profile` - Update user profile information and settings
* `POST /cases/:caseId/invitations` - Send case invitation email to specified user
* `GET /cases/:caseId/invitations` - List all pending invitations for a case
* `DELETE /cases/:caseId/invitations/:invitationId` - Cancel a pending case invitation
* `POST /invitations/:token/accept` - Accept case invitation using token from email

---

*End of Planning.md*