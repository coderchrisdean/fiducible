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

---

*End of Planning.md*