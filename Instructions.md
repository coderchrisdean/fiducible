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

## Implementation Plan & Checkpoints

### Phase 1: Critical Fixes (Priority: Immediate)

#### Checkpoint 1A: Fix Time Tracking Route (2 hours)
**Files to modify:**
- `client/src/App.tsx` - Verify route configuration
- `client/src/pages/time-tracking.tsx` - Debug state issues
- `server/routes.ts` - Ensure API endpoints are correct

**Tasks:**
- [ ] Verify wouter routing syntax for /time-tracking
- [ ] Check TanStack Query cache keys and invalidation
- [ ] Test form submission and data persistence
- [ ] Validate API response handling

#### Checkpoint 1B: Browser Navigation Fix (2 hours)
**Files to modify:**
- `client/src/App.tsx` - Add proper history handling
- `client/src/lib/queryClient.ts` - Configure cache persistence
- All page components - Add proper cleanup and re-initialization

**Tasks:**
- [ ] Implement proper browser history state management
- [ ] Configure TanStack Query to persist on page refresh
- [ ] Add page-level useEffect for proper mounting
- [ ] Test back button behavior across all routes

#### Checkpoint 1C: Enhanced Form Validation (3 hours)
**Files to modify:**
- `client/src/pages/signup.tsx` - Add regex validations
- `shared/schema.ts` - Update validation schemas
- `client/src/components/ui/form.tsx` - Enhance error display

**Validation Rules:**
- Name: `/^[A-Za-z\s]{2,50}$/` (letters and spaces only, 2-50 chars)
- Email: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (standard email format)
- Password: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/` (min 8 chars, mixed case, number, special char)

**Tasks:**
- [ ] Add hidden regex validation to signup schema
- [ ] Implement real-time inline error display
- [ ] Style error states with red text and icons
- [ ] Test all validation scenarios

### Phase 2: iOS-Inspired UI Overhaul (Priority: High)

#### Checkpoint 2A: Design System Update (4 hours)
**Files to modify:**
- `client/src/index.css` - Update CSS variables and base styles
- `tailwind.config.ts` - Configure new color palette
- `client/src/components/ui/` - Update all UI components

**iOS Design Elements:**
- Rounded corners (8px standard, 12px cards)
- Soft shadows and subtle borders
- Clean typography (system fonts)
- Minimal color palette (whites, grays, single accent color)
- Generous whitespace and padding

**Tasks:**
- [ ] Define new CSS custom properties for iOS-style colors
- [ ] Update button styles with iOS-inspired design
- [ ] Redesign card components with soft shadows
- [ ] Implement clean form input styling

#### Checkpoint 2B: Page Layout Redesign (3 hours)
**Files to modify:**
- `client/src/components/layout.tsx` - Update sidebar/navigation
- `client/src/pages/dashboard.tsx` - Redesign dashboard layout
- `client/src/pages/landing.tsx` - Clean, minimal landing page
- `client/src/pages/login.tsx` - Simplified login form
- `client/src/pages/signup.tsx` - Clean signup interface

**Tasks:**
- [ ] Create clean, minimal navigation sidebar
- [ ] Redesign dashboard with card-based layout
- [ ] Simplify landing page with clear value proposition
- [ ] Style authentication forms with iOS aesthetics

#### Checkpoint 2C: Component Refinement (2 hours)
**Files to modify:**
- `client/src/pages/time-tracking.tsx` - Clean time entry interface
- `client/src/pages/conservatees.tsx` - Simplified conservatee management
- All form components - Consistent styling

**Tasks:**
- [ ] Redesign time tracking with minimal, clean interface
- [ ] Update conservatee management with card-based layout
- [ ] Ensure consistent form styling across all pages
- [ ] Add subtle animations and transitions

### Phase 3: Documentation & Code Quality

#### Checkpoint 3A: Code Documentation (1 hour)
**Files to modify:**
- `Planning.md` - Update with current state
- `FEATURES.md` - Created (complete)
- `ROUTES.md` - Created (complete)
- `Instructions.md` - This comprehensive plan

**Tasks:**
- [x] Create FEATURES.md with prioritized backlog
- [x] Create ROUTES.md documenting all endpoints
- [ ] Update Planning.md with current architecture
- [x] Add implementation checkpoints to Instructions.md

### Implementation Schedule

**Day 1-2: Critical Fixes**
- Morning: Fix time tracking route issues
- Afternoon: Implement browser navigation fixes
- Evening: Add comprehensive form validation

**Day 3-4: UI Overhaul**
- Morning: Design system and CSS updates
- Afternoon: Page layout redesign
- Evening: Component refinement and testing

**Day 5: Polish & Documentation**
- Morning: Final testing and bug fixes
- Afternoon: Documentation updates
- Evening: Deployment preparation

### File Impact Summary

**High Impact (Core Changes):**
- `client/src/App.tsx` - Routing fixes
- `client/src/index.css` - Design system overhaul
- `client/src/pages/signup.tsx` - Enhanced validation
- `shared/schema.ts` - Updated validation schemas

**Medium Impact (Styling):**
- All page components in `client/src/pages/`
- All UI components in `client/src/components/ui/`
- `client/src/components/layout.tsx`

**Low Impact (Documentation):**
- `Planning.md`, `FEATURES.md`, `ROUTES.md`
- `Instructions.md` (this file)

### Success Criteria

**Phase 1 Complete When:**
- /time-tracking route works without errors
- Browser back/refresh maintains proper state
- Signup form shows inline validation errors
- All existing functionality remains intact

**Phase 2 Complete When:**
- Application has clean, iOS-inspired aesthetic
- All components use consistent design language
- Interface feels modern and professional
- Light theme is polished and cohesive

**Phase 3 Complete When:**
- All documentation is current and comprehensive
- Code follows established patterns
- Implementation plan is validated
- Ready for next feature development

## Future Enhancement Areas

- Document management system
- Financial tracking and reporting
- Visit logging and scheduling
- Medication management
- Audit trails and compliance reporting
- Multi-user collaboration features