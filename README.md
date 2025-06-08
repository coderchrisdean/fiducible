# Fiducible - Conservatorship Management Web Application

## Project Overview

Fiducible is a comprehensive React-based fiduciary management application designed to help professionals track time, manage conservatee cases, and streamline administrative workflows. The application provides enhanced user experience and productivity tools for conservatorship management with secure authentication, document management, and case tracking capabilities.

## Technology Stack

### Frontend
- **React 18** with TypeScript for type safety and modern development
- **Vite** for fast development and optimized builds
- **Wouter** for lightweight client-side routing
- **TanStack Query (React Query v5)** for server state management and caching
- **React Hook Form** with Zod validation for form handling
- **Shadcn/ui** component library built on Radix UI primitives
- **Tailwind CSS** for utility-first styling with custom design system
- **Lucide React** for consistent iconography

### Backend
- **Express.js** with TypeScript for robust API server
- **PostgreSQL** database for reliable data persistence
- **Drizzle ORM** for type-safe database operations
- **JWT Authentication** with email verification via Resend
- **Passport.js** for authentication middleware
- **Express Session** with PostgreSQL session store
- **Multer** for file upload handling

### Development & Deployment
- **TypeScript** throughout the entire stack for type safety
- **ESBuild** for fast TypeScript compilation
- **Drizzle Kit** for database migrations and schema management
- **PostCSS** with Autoprefixer for CSS processing

## Architecture Overview

### Full-Stack JavaScript Architecture
The application follows modern web development patterns with a clear separation of concerns:

- **Frontend-Heavy Architecture**: Maximum functionality implemented in React frontend
- **Thin Backend**: Express server handles only data persistence and external API calls
- **Shared Types**: Common TypeScript interfaces in `shared/schema.ts` ensure type consistency
- **File Consolidation**: Similar components collapsed into single files for maintainability

### Authentication System

#### JWT-Based Authentication with Email Verification
- **Registration Flow**: Users register → receive verification email via Resend → verify email → can log in
- **Login Protection**: Login blocked until email verification complete
- **Token Management**: JWT tokens stored in localStorage with automatic refresh
- **Middleware Protection**: All protected routes require valid JWT token

#### Authentication Endpoints
```
POST /api/register     - Create account with email verification
POST /api/login        - Authenticate verified users
GET  /api/verify-email/:token - Verify email addresses
POST /api/resend-verification - Resend verification emails
GET  /api/user         - Get authenticated user data
POST /api/logout       - Client-side token removal
```

### Database Schema

#### Core Tables
```sql
-- Users table for authentication
users (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  global_role VARCHAR DEFAULT 'user',
  email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Conservatees for case management
conservatees (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  name VARCHAR NOT NULL,
  case_number VARCHAR UNIQUE,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
)

-- Time entries for tracking work
time_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  conservatee_id INTEGER REFERENCES conservatees(id),
  date DATE NOT NULL,
  task_description TEXT NOT NULL,
  time_spent VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Sessions for authentication
sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
)
```

#### Document Management Schema
```sql
-- Document folders for organization
document_folders (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES conservatees(id),
  name VARCHAR NOT NULL,
  parent_id INTEGER REFERENCES document_folders(id),
  created_at TIMESTAMP DEFAULT NOW()
)

-- Document storage and metadata
documents (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES conservatees(id),
  folder_id INTEGER REFERENCES document_folders(id),
  name VARCHAR NOT NULL,
  file_path VARCHAR NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR NOT NULL,
  search_text TEXT,
  upload_date TIMESTAMP DEFAULT NOW(),
  download_count INTEGER DEFAULT 0
)

-- Document tagging system
document_tags (
  id SERIAL PRIMARY KEY,
  case_id INTEGER REFERENCES conservatees(id),
  name VARCHAR NOT NULL,
  color VARCHAR DEFAULT '#3b82f6'
)

-- Document access logging
document_access_logs (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id),
  user_id INTEGER REFERENCES users(id),
  action VARCHAR NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW()
)
```

### API Architecture

#### RESTful API Design
- **Prefix Convention**: All API routes prefixed with `/api`
- **Authentication Middleware**: Protected routes use JWT verification
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **Request Validation**: Zod schemas validate all request bodies
- **Response Formatting**: Standardized JSON response structure

#### Dashboard API Endpoints
```
GET /api/dashboard/stats         - User-specific statistics
GET /api/dashboard/recent-entries - Recent time entries for user
GET /api/time-entries           - Paginated time entries for user
POST /api/time-entries          - Create new time entry
PUT /api/time-entries/:id       - Update time entry
DELETE /api/time-entries/:id    - Delete time entry
```

#### Document Management API
```
GET /api/documents              - List documents for case
POST /api/documents/upload      - Upload new document
GET /api/documents/:id/download - Download document file
PUT /api/documents/:id          - Update document metadata
DELETE /api/documents/:id       - Delete document
POST /api/documents/:id/tags    - Add tags to document
```

### Frontend Architecture

#### Component Structure
```
client/src/
├── components/           # Reusable UI components
│   ├── ui/              # Shadcn/ui base components
│   ├── layout.tsx       # Main application layout
│   └── auth/            # Authentication components
├── pages/               # Route-level page components
│   ├── dashboard.tsx    # Main dashboard with stats
│   ├── auth-page.tsx    # Login/registration forms
│   ├── time-entries.tsx # Time tracking interface
│   └── documents.tsx    # Document management
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication state management
│   └── use-toast.ts     # Toast notification system
├── lib/                 # Utility functions and configurations
│   ├── queryClient.ts   # TanStack Query configuration
│   └── utils.ts         # Helper functions
└── App.tsx             # Root component with routing
```

#### State Management
- **TanStack Query**: Server state caching and synchronization
- **React Hook Form**: Form state and validation
- **Context API**: Authentication state and theme management
- **localStorage**: JWT token persistence

#### Routing System
```typescript
// Wouter-based routing with authentication guards
<Switch>
  <ProtectedRoute path="/" component={Dashboard} />
  <ProtectedRoute path="/time-entries" component={TimeEntries} />
  <ProtectedRoute path="/documents" component={Documents} />
  <Route path="/auth" component={AuthPage} />
  <Route component={NotFound} />
</Switch>
```

### Email Integration

#### Resend Email Service
- **API Integration**: Resend API for transactional emails
- **Email Templates**: HTML templates for verification emails
- **Environment Configuration**: RESEND_API_KEY required for email functionality
- **Error Handling**: Graceful fallback when email service unavailable

#### Email Verification Flow
1. User registers with email/password
2. System generates verification token
3. Verification email sent via Resend
4. User clicks email link → token verified
5. User can now log in to application

### File Storage System

#### Local File Storage
```typescript
interface FileStorageInterface {
  saveFile(buffer: Buffer, fileName: string, mimeType: string): Promise<string>
  getFile(filePath: string): Promise<Buffer>
  deleteFile(filePath: string): Promise<boolean>
  getFileUrl(filePath: string): string
}
```

#### File Upload Configuration
- **Maximum File Size**: 10MB per upload
- **Allowed MIME Types**: PDF, Word docs, images, text files
- **Storage Location**: `./uploads/` directory with organized folder structure
- **Security**: File validation and sanitization on upload

### Development Guidelines

#### Code Organization
- **Shared Schema**: TypeScript types in `shared/schema.ts` for frontend/backend consistency
- **Error Handling**: Comprehensive error boundaries and API error responses
- **Type Safety**: Strict TypeScript configuration with no `any` types
- **Code Splitting**: Lazy loading for non-critical components

#### Database Operations
- **ORM Usage**: Drizzle ORM for all database interactions
- **Migration Strategy**: `npm run db:push` for schema changes
- **Transaction Support**: Database transactions for complex operations
- **Connection Pooling**: PostgreSQL connection pool for performance

#### Security Implementation
- **Password Hashing**: bcrypt for secure password storage
- **JWT Security**: Signed tokens with expiration
- **CORS Configuration**: Proper cross-origin request handling
- **Input Validation**: Zod schemas for all user inputs
- **SQL Injection Prevention**: Parameterized queries via Drizzle

### Environment Configuration

#### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/fiducible

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key

# Email Service
RESEND_API_KEY=your-resend-api-key

# Application
NODE_ENV=development
PORT=3000
```

#### Development Setup
```bash
# Install dependencies
npm install

# Setup database
npm run db:push

# Start development server
npm run dev
```

### Debugging and Troubleshooting

#### Common Issues and Solutions

1. **Email Verification Not Working**
   - Check RESEND_API_KEY is set correctly
   - Verify email templates are properly formatted
   - Check spam folder for verification emails

2. **Database Connection Issues**
   - Verify DATABASE_URL format and credentials
   - Ensure PostgreSQL service is running
   - Check database exists and is accessible

3. **Authentication Failures**
   - Verify JWT_SECRET is set and consistent
   - Check token expiration and refresh logic
   - Ensure email verification is complete

4. **File Upload Problems**
   - Check file size limits (10MB max)
   - Verify MIME type is in allowed list
   - Ensure uploads directory exists and is writable

#### Logging and Monitoring
- **Console Logging**: Structured logging for debugging
- **Error Tracking**: Comprehensive error boundaries
- **Database Logging**: Query logging in development
- **API Request Logging**: Request/response logging

### Testing Strategy

#### Frontend Testing
- **Component Testing**: React Testing Library for UI components
- **Hook Testing**: Custom hook testing with proper mocking
- **Integration Testing**: Full user flow testing
- **API Integration**: Mock API responses for frontend testing

#### Backend Testing
- **Unit Testing**: Individual function and middleware testing
- **API Testing**: Endpoint testing with proper authentication
- **Database Testing**: Repository pattern testing with test database
- **Integration Testing**: Full stack request/response testing

### Performance Optimization

#### Frontend Optimizations
- **Code Splitting**: Lazy loading for route-level components
- **Query Caching**: TanStack Query for efficient data fetching
- **Image Optimization**: Proper image sizing and formats
- **Bundle Analysis**: Webpack bundle analyzer for optimization

#### Backend Optimizations
- **Database Indexing**: Proper indexing for query performance
- **Connection Pooling**: PostgreSQL connection pool management
- **Query Optimization**: Efficient database queries with joins
- **Caching Strategy**: Redis caching for frequently accessed data

### Deployment Considerations

#### Production Configuration
- **Environment Variables**: Secure storage of sensitive configuration
- **Database Migrations**: Automated migration deployment
- **Static Asset Serving**: Optimized static file serving
- **HTTPS Configuration**: SSL/TLS certificate management

#### Monitoring and Maintenance
- **Health Checks**: Application health monitoring endpoints
- **Error Monitoring**: Production error tracking and alerting
- **Performance Monitoring**: Application performance metrics
- **Database Monitoring**: Database performance and query analysis

## OpenAI Codex Integration

This README provides comprehensive documentation for OpenAI Codex to understand the complete project structure, dependencies, and implementation details for effective debugging and analysis assistance.

### Key Areas for Codex Analysis
1. **Authentication Flow**: JWT implementation with email verification
2. **Database Schema**: PostgreSQL with Drizzle ORM relationships
3. **API Architecture**: RESTful endpoints with proper error handling
4. **Frontend State Management**: TanStack Query with React hooks
5. **File Management**: Document upload and storage system
6. **Security Implementation**: Authentication middleware and input validation

### Common Debugging Scenarios
- Authentication token issues and email verification flow
- Database query optimization and relationship management
- Frontend form validation and error handling
- File upload and storage functionality
- API endpoint testing and response formatting
- Type safety issues across frontend/backend boundary