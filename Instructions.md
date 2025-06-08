# Fiducible Development Instructions

## Project Overview

**App:** Fiducible  
**Purpose:** A comprehensive fiduciary management application for tracking conservatorship workflows, time entries, and case management.

## Technology Stack

- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Express.js with Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Shadcn/ui components with Tailwind CSS
- **Authentication**: Passport.js with local strategy
- **State Management**: TanStack Query for server state, React hooks for local state

## Architecture Guidelines

### Frontend Structure
- Put maximum functionality in the frontend
- Backend handles only data persistence and API calls
- Use React Query for all server state management
- Implement proper loading states and error handling

### Data Model First Approach
1. Always define schemas in `shared/schema.ts` first
2. Use Drizzle ORM with PostgreSQL tables
3. Generate insert/select types with `drizzle-zod`
4. Keep data models simple - avoid unnecessary timestamp fields

### Storage Interface
- Prefer in-memory storage (MemStorage) unless database is specifically required
- Update `IStorage` interface in `server/storage.ts` for new CRUD operations
- Ensure storage methods use proper types from `shared/schema.ts`

## Key Features Implemented

### 1. Authentication System
- User registration and login
- Session management with Passport.js
- Protected routes with authentication middleware

### 2. Dashboard
- Overview of conservatee cases
- Recent activity summaries
- Quick navigation to key features

### 3. Time Tracking
- Record time entries for conservatee work
- Edit and manage existing entries
- Associate time with specific conservatees

### 4. Conservatee Management
- Add new conservatee profiles
- Edit existing conservatee information
- View conservatee details and associated time entries

### 5. Responsive Design
- Mobile-friendly interface
- Consistent styling with Tailwind CSS
- Professional UI with Shadcn components

## Brand Assets

### Logo Integration
- **Location**: `/public/fiducible-logo.png`
- **Design**: Shield with checkmark, transparent background
- **Usage**: Reference as `/fiducible-logo.png` in components

### Logo Replacement Process
1. Add new logo file to `/public/` directory
2. Update filename references in components if needed
3. Test across light/dark themes and screen sizes
4. Ensure proper contrast and readability

### Logo Specifications
- **Format**: PNG with transparency or SVG preferred
- **Minimum Width**: 200px for crisp display
- **Spacing**: Maintain 20px minimum padding around logo
- **Consistency**: Use same logo across all application pages

## Development Workflow

### Database Changes
1. Update schema in `shared/schema.ts`
2. Modify storage interface in `server/storage.ts`
3. Run `npm run db:push` to apply changes
4. Never write manual SQL migrations

### Frontend Components
- Use Wouter for routing (`client/src/App.tsx`)
- Store pages in `client/src/pages/` directory
- Use `react-hook-form` with `zodResolver` for forms
- Implement proper error states and loading indicators

### API Development
- Define routes in `server/routes.ts`
- Keep route handlers thin - delegate to storage interface
- Validate request bodies with Zod schemas
- Use proper HTTP status codes and error responses

### Styling Guidelines
- Primary framework: Tailwind CSS
- Component library: Shadcn/ui
- Icons: Lucide React for actions, React Icons for logos
- Dark mode support with explicit light/dark variants

## File Organization

```
/client/src/
  /components/    # Reusable UI components
  /pages/         # Page-level views
  /hooks/         # Custom React hooks
  /lib/           # Utilities and configurations

/server/
  index.ts        # Express server setup
  routes.ts       # API route definitions
  storage.ts      # Data storage interface
  db.ts           # Database connection

/shared/
  schema.ts       # Database schemas and types

/public/
  fiducible-logo.png  # Application logo
```

## Quality Standards

### Code Quality
- Use TypeScript for type safety
- Implement proper error handling
- Write descriptive variable and function names
- Keep functions focused and single-purpose

### User Experience
- Provide immediate feedback for user actions
- Show loading states during async operations
- Display clear error messages with actionable guidance
- Ensure consistent navigation and layout

### Performance
- Optimize query keys for efficient cache invalidation
- Use React Query for server state management
- Implement proper form validation
- Minimize unnecessary re-renders

## Security Considerations

- Never expose sensitive data in frontend code
- Use secure session management
- Validate all user inputs on both client and server
- Implement proper authentication checks on protected routes

## Future Enhancement Areas

- Document management system
- Financial tracking and reporting
- Visit logging and scheduling
- Medication management
- Audit trails and compliance reporting
- Multi-user collaboration features