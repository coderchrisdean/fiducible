# Fiducible Development Instructions

## Project Overview

**App:** Fiducible  
**Purpose:** A comprehensive fiduciary management application for tracking conservatorship workflows, time entries, and case management.

## Technology Stack

- **Frontend**: React with TypeScript, Vite build system
- **Backend**: Express.js with Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **UI Framework**: Shadcn/ui components with Tailwind CSS
- **Authentication**: JWT-based authentication with bcrypt password hashing
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
- JWT-based user registration and login
- Token-based session management stored in localStorage
- Protected routes with JWT token validation middleware
- Password hashing with bcrypt for security

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

## Authentication System

### Overview
The application uses JWT (JSON Web Token) based authentication for secure user management. This system replaced the previous Replit Auth implementation to provide more control and flexibility.

### Backend Implementation

#### JWT Authentication Module (`server/jwtAuth.ts`)
- **Token Generation**: Creates JWT tokens with user data (id, email, name, globalRole)
- **Token Verification**: Validates incoming JWT tokens and extracts user information
- **Password Security**: Uses bcrypt with 10 salt rounds for password hashing
- **Middleware**: `authenticateToken` function validates Bearer tokens on protected routes

#### Authentication Routes
- `POST /api/login` - User login with email/password
- `POST /api/register` - User registration with email/password
- `GET /api/user` - Get current authenticated user
- `POST /api/logout` - Client-side logout (token removal)

#### Environment Variables
- `JWT_SECRET` - Secret key for JWT signing (defaults to "your-secret-key-here")
- Token expiration set to 7 days

### Frontend Implementation

#### Authentication Hook (`client/src/hooks/useAuth.ts`)
- **State Management**: Uses TanStack Query for user state
- **Token Storage**: Stores JWT tokens in localStorage as 'auth_token'
- **Mutations**: Provides loginMutation, registerMutation for auth actions
- **Logout**: Clears token and redirects to home page

#### Request Authentication (`client/src/lib/queryClient.ts`)
- **Authorization Headers**: Automatically adds Bearer token to all API requests
- **Token Management**: Reads token from localStorage for each request
- **Error Handling**: Handles 401 responses for token validation

### Protected Routes
All document management and user-specific routes require authentication:
- Document upload, download, access control
- User profile and settings
- Case management operations

### Security Features
- **Password Hashing**: bcrypt with salt rounds for secure password storage
- **Token Expiration**: 7-day expiration for JWT tokens
- **Bearer Token Authentication**: Standard Authorization header format
- **Client-side Token Storage**: localStorage for session persistence

### Email Verification Flow
- **Registration**: New users receive verification email via Resend
- **Login Restriction**: Users must verify email before first login
- **Token Expiration**: Verification tokens expire after 24 hours
- **Resend Capability**: Users can request new verification emails

### Migration from Replit Auth
- Removed OpenID Connect dependencies
- Replaced session-based auth with token-based auth
- Updated all protected routes to use JWT middleware
- Modified frontend to handle token-based authentication
- Integrated Resend for email verification system

## Security Considerations

- Never expose sensitive data in frontend code
- JWT tokens stored securely in localStorage
- All passwords hashed with bcrypt before storage
- Validate all user inputs on both client and server
- Implement proper authentication checks on protected routes
- Token-based authentication prevents CSRF attacks

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

## Document Management Feature Plan

### Feature Overview

The Document Management system will enable users to upload, organize, search, and share case-related documents within Fiducible. Documents will be tied to specific cases and accessible based on user permissions within each case.

**Core Capabilities:**
- Document upload with drag-and-drop interface
- Hierarchical folder structure with tagging system
- Full-text search using PostgreSQL's TSVector
- Case-based access control and sharing
- Document versioning and metadata tracking
- Secure download with audit trails

**Storage Strategy:**
- **Phase 1**: Local file storage in `/uploads` directory
- **Phase 2**: AWS S3 integration for production scalability
- Environment variable `STORAGE_TYPE` to toggle between "local" and "s3"

### Database Models

#### Documents Table
```typescript
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull().references(() => cases.id),
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size").notNull(), // bytes
  mimeType: text("mime_type").notNull(),
  folderId: integer("folder_id").references(() => documentFolders.id),
  searchVector: text("search_vector"), // TSVector for full-text search
  downloadCount: integer("download_count").notNull().default(0),
  isArchived: boolean("is_archived").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

#### Document Folders Table
```typescript
export const documentFolders = pgTable("document_folders", {
  id: serial("id").primaryKey(),
  caseId: integer("case_id").notNull().references(() => cases.id),
  name: text("name").notNull(),
  parentId: integer("parent_id").references(() => documentFolders.id),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### Document Tags Table
```typescript
export const documentTags = pgTable("document_tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6366f1"), // Hex color for UI
  caseId: integer("case_id").notNull().references(() => cases.id),
  createdBy: integer("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### Document Tag Relations Table
```typescript
export const documentTagRelations = pgTable("document_tag_relations", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id),
  tagId: integer("tag_id").notNull().references(() => documentTags.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

#### Document Access Logs Table
```typescript
export const documentAccessLogs = pgTable("document_access_logs", {
  id: serial("id").primaryKey(),
  documentId: integer("document_id").notNull().references(() => documents.id),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action", { enum: ["view", "download", "edit", "delete"] }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Required Packages

**Backend Dependencies:**
```json
{
  "multer": "^1.4.5-lts.1",
  "@types/multer": "^1.4.11",
  "mime-types": "^2.1.35",
  "@types/mime-types": "^2.1.4",
  "aws-sdk": "^2.1691.0",
  "@aws-sdk/client-s3": "^3.645.0",
  "sharp": "^0.33.5"
}
```

**Frontend Dependencies:**
```json
{
  "react-dropzone": "^14.2.3",
  "@tanstack/react-virtual": "^3.10.8",
  "fuse.js": "^7.0.0"
}
```

### Environment Variables

```env
# Document Storage Configuration
STORAGE_TYPE=local # or "s3"
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760 # 10MB in bytes
ALLOWED_FILE_TYPES=pdf,doc,docx,txt,jpg,jpeg,png,gif

# AWS S3 Configuration (when STORAGE_TYPE=s3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=fiducible-documents
S3_BUCKET_REGION=us-east-1

# Full-text Search Configuration
ENABLE_FULL_TEXT_SEARCH=true
SEARCH_LANGUAGE=english # PostgreSQL text search language
```

### API Endpoints

#### Document Upload
**POST /api/cases/:caseId/documents/upload**
- **Description**: Upload document(s) to a specific case
- **Parameters**: `caseId: number`
- **Body**: `FormData` with file(s) and metadata
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
- **Features**: 
  - File validation (type, size)
  - Automatic text extraction for search indexing
  - Thumbnail generation for images
  - Virus scanning (future enhancement)

#### Document Listing
**GET /api/cases/:caseId/documents**
- **Description**: List documents in a case with filtering
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

#### Document Download
**GET /api/documents/:id/download**
- **Description**: Download document with access logging
- **Parameters**: `id: number`
- **Response**: File stream with appropriate headers
- **Features**:
  - Access control validation
  - Download counter increment
  - Access logging for audit trails
  - Content-Disposition headers for proper file naming

#### Document Search
**GET /api/cases/:caseId/documents/search**
- **Description**: Full-text search across documents
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

#### Folder Management
**POST /api/cases/:caseId/folders**
- **Description**: Create document folder
- **Body**: `{ name: string, parentId?: number }`

**GET /api/cases/:caseId/folders**
- **Description**: List folder hierarchy

**PUT /api/folders/:id**
- **Description**: Update folder name/parent

**DELETE /api/folders/:id**
- **Description**: Delete folder (must be empty)

#### Tag Management
**POST /api/cases/:caseId/tags**
- **Description**: Create document tag
- **Body**: `{ name: string, color?: string }`

**GET /api/cases/:caseId/tags**
- **Description**: List all tags for case

**PUT /api/tags/:id**
- **Description**: Update tag properties

**DELETE /api/tags/:id**
- **Description**: Delete tag and remove from documents

#### Document Operations
**PUT /api/documents/:id**
- **Description**: Update document metadata
- **Body**: `{ title?: string, description?: string, folderId?: number }`

**DELETE /api/documents/:id**
- **Description**: Archive/delete document

**POST /api/documents/:id/tags**
- **Description**: Add tags to document
- **Body**: `{ tagIds: number[] }`

**DELETE /api/documents/:id/tags/:tagId**
- **Description**: Remove tag from document

### Frontend Components & Routes

#### New Pages
1. **Document Manager Page** (`/cases/:caseId/documents`)
   - File: `client/src/pages/documents.tsx`
   - Main document management interface
   - Folder navigation with breadcrumbs
   - Document grid/list view toggle

2. **Document Viewer Page** (`/documents/:id/view`)
   - File: `client/src/pages/document-viewer.tsx`
   - Document preview with metadata panel
   - Tag management interface
   - Download and sharing options

#### Core Components

1. **Document Upload Component**
   - File: `client/src/components/document-upload.tsx`
   - Drag-and-drop interface with progress bars
   - File validation and preview
   - Bulk upload support

2. **Document List Component**
   - File: `client/src/components/document-list.tsx`
   - Virtualized list for performance
   - Sort and filter controls
   - Context menu for document actions

3. **Folder Tree Component**
   - File: `client/src/components/folder-tree.tsx`
   - Hierarchical folder navigation
   - Drag-and-drop folder organization
   - New folder creation

4. **Search Bar Component**
   - File: `client/src/components/document-search.tsx`
   - Full-text search with autocomplete
   - Advanced search filters
   - Search history and suggestions

5. **Tag Manager Component**
   - File: `client/src/components/tag-manager.tsx`
   - Tag creation and editing
   - Color picker for tag styling
   - Tag assignment interface

6. **Document Card Component**
   - File: `client/src/components/document-card.tsx`
   - Document thumbnail and metadata
   - Quick actions (download, share, tag)
   - File type icons and previews

### Implementation Checkpoints

#### Phase 1: Core Infrastructure (8-10 hours)

**Checkpoint 1A: Database Schema & Storage Setup (3 hours)**
- Files to modify:
  - `shared/schema.ts` - Add all document-related tables
  - `server/storage.ts` - Implement IStorage methods for documents
  - `server/fileStorage.ts` - New file for local/S3 storage abstraction
- Tasks:
  - [ ] Define document database models with relations
  - [ ] Create storage interface methods for CRUD operations
  - [ ] Implement local file storage with proper error handling
  - [ ] Add environment variable configuration

**Checkpoint 1B: File Upload Infrastructure (3 hours)**
- Files to modify:
  - `server/routes.ts` - Add document upload endpoints
  - `server/middleware/fileUpload.ts` - New multer configuration
  - `server/utils/fileValidation.ts` - New file validation utilities
- Tasks:
  - [ ] Configure multer for file uploads
  - [ ] Implement file validation (type, size, security)
  - [ ] Create upload endpoint with metadata handling
  - [ ] Add error handling for upload failures

**Checkpoint 1C: Basic API Endpoints (2-3 hours)**
- Files to modify:
  - `server/routes.ts` - Document CRUD endpoints
  - `server/utils/searchUtils.ts` - New search utilities
- Tasks:
  - [ ] Implement document listing with pagination
  - [ ] Create download endpoint with access control
  - [ ] Add basic search functionality
  - [ ] Implement document deletion/archiving

#### Phase 2: Frontend Components (10-12 hours)

**Checkpoint 2A: Upload Interface (4 hours)**
- Files to create:
  - `client/src/components/document-upload.tsx`
  - `client/src/components/ui/file-dropzone.tsx`
  - `client/src/hooks/useFileUpload.ts`
- Tasks:
  - [ ] Create drag-and-drop upload component
  - [ ] Implement upload progress indicators
  - [ ] Add file validation on frontend
  - [ ] Handle upload errors gracefully

**Checkpoint 2B: Document List & Navigation (4 hours)**
- Files to create:
  - `client/src/components/document-list.tsx`
  - `client/src/components/folder-tree.tsx`
  - `client/src/components/document-card.tsx`
- Tasks:
  - [ ] Build document listing with virtual scrolling
  - [ ] Create folder navigation component
  - [ ] Implement sort and filter controls
  - [ ] Add document preview thumbnails

**Checkpoint 2C: Search & Tagging (3-4 hours)**
- Files to create:
  - `client/src/components/document-search.tsx`
  - `client/src/components/tag-manager.tsx`
  - `client/src/hooks/useDocumentSearch.ts`
- Tasks:
  - [ ] Build search interface with filters
  - [ ] Create tag management system
  - [ ] Implement search autocomplete
  - [ ] Add advanced search modal

#### Phase 3: Advanced Features (6-8 hours)

**Checkpoint 3A: Full-Text Search (3 hours)**
- Files to modify:
  - `server/utils/searchUtils.ts` - PostgreSQL TSVector implementation
  - `server/routes.ts` - Search endpoints
  - `shared/schema.ts` - Add search vector columns
- Tasks:
  - [ ] Implement PostgreSQL full-text search
  - [ ] Add text extraction from documents
  - [ ] Create search indexing system
  - [ ] Add search result ranking

**Checkpoint 3B: Folder Management (2 hours)**
- Files to create:
  - `client/src/components/folder-manager.tsx`
  - `server/routes.ts` - Folder endpoints
- Tasks:
  - [ ] Implement folder CRUD operations
  - [ ] Add drag-and-drop folder organization
  - [ ] Create folder hierarchy navigation
  - [ ] Handle folder permissions

**Checkpoint 3C: Document Viewer & Metadata (2-3 hours)**
- Files to create:
  - `client/src/pages/document-viewer.tsx`
  - `client/src/components/document-preview.tsx`
- Tasks:
  - [ ] Build document viewer page
  - [ ] Implement file preview for common types
  - [ ] Add metadata editing interface
  - [ ] Create document sharing controls

#### Phase 4: Performance & Security (4-6 hours)

**Checkpoint 4A: Performance Optimization (2-3 hours)**
- Files to modify:
  - `client/src/components/document-list.tsx` - Add virtualization
  - `server/routes.ts` - Add caching headers
  - `server/utils/imageProcessing.ts` - New thumbnail generation
- Tasks:
  - [ ] Implement virtual scrolling for large document lists
  - [ ] Add thumbnail generation for images/PDFs
  - [ ] Optimize database queries with proper indexing
  - [ ] Add response caching for document metadata

**Checkpoint 4B: Security & Access Control (2-3 hours)**
- Files to create:
  - `server/middleware/documentAuth.ts` - Document access control
  - `server/utils/auditLog.ts` - Access logging utilities
- Tasks:
  - [ ] Implement case-based document access control
  - [ ] Add document access logging for audits
  - [ ] Validate file uploads for security threats
  - [ ] Add rate limiting for upload endpoints

#### Phase 5: S3 Integration & Deployment (3-4 hours)

**Checkpoint 5A: AWS S3 Integration (2-3 hours)**
- Files to create:
  - `server/storage/s3Storage.ts` - S3 storage implementation
  - `server/utils/storageFactory.ts` - Storage provider factory
- Tasks:
  - [ ] Implement S3 upload/download functionality
  - [ ] Add storage provider switching via environment variables
  - [ ] Configure S3 bucket policies and permissions
  - [ ] Add S3 error handling and retries

**Checkpoint 5B: Testing & Documentation (1-2 hours)**
- Files to modify:
  - `ROUTES.md` - Add document endpoints
  - `README.md` - Update with document features
- Tasks:
  - [ ] Test all document operations end-to-end
  - [ ] Update API documentation
  - [ ] Add user documentation for document features
  - [ ] Test file upload limits and error scenarios

### Integration Points

**Navigation Updates:**
- Add "Documents" tab to case navigation
- Update case dashboard to show document metrics
- Add quick document upload to case header

**Permission Integration:**
- Leverage existing case role system for document access
- Add document-specific permissions to case roles
- Integrate with user case role validation

**Search Integration:**
- Include documents in global case search
- Add document results to existing search interfaces
- Cross-reference documents with time entries and conservatees

### Total Estimated Effort: 30-40 hours
- Database & API Development: 12-15 hours
- Frontend Components: 14-18 hours  
- Advanced Features & Polish: 8-12 hours
- Testing & Documentation: 3-5 hours

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