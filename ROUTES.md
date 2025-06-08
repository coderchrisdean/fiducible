# Route Documentation

## Frontend Routes (React Router)

### Public Routes
- `/` - Landing page with app introduction and navigation
- `/login` - User authentication form
- `/signup` - User registration form
- `/*` - Not found page (catch-all)

### Protected Routes (require Layout wrapper)
- `/dashboard` - Main dashboard with overview and statistics
- `/time-tracking` - Time entry management interface
- `/conservatees` - Conservatee profile management

## Backend API Routes

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
  - Body: `{ name, email, password }`
  - Returns: `{ user: UserObject }`
  - Status: 200 (success), 400 (user exists/invalid data)

- `POST /api/auth/signin` - User login
  - Body: `{ email, password }`
  - Returns: `{ user: UserObject }`
  - Status: 200 (success), 401 (invalid credentials), 500 (server error)

- `GET /api/auth/user` - Get current user session
  - Returns: `{ id, name, email, role }`
  - Status: 200 (authenticated), 401 (not authenticated)

### Conservatee Management
- `GET /api/conservatees` - List all conservatees for logged-in conservator
  - Returns: `Conservatee[]`
  - Status: 200 (success), 500 (server error)

- `POST /api/conservatees` - Create new conservatee
  - Body: `{ name, dateOfBirth, address, phone, email, notes }`
  - Returns: `Conservatee`
  - Status: 200 (success), 400 (invalid data)

- `PUT /api/conservatees/:id` - Update existing conservatee
  - Body: `Partial<ConservateeData>`
  - Returns: `Conservatee`
  - Status: 200 (success), 400 (invalid data), 404 (not found)

- `DELETE /api/conservatees/:id` - Delete conservatee
  - Returns: `{ message: "Conservatee deleted" }`
  - Status: 200 (success), 404 (not found), 500 (server error)

### Time Entry Management
- `GET /api/time-entries` - List all time entries for logged-in conservator
  - Returns: `TimeEntry[]`
  - Status: 200 (success), 500 (server error)

- `POST /api/time-entries` - Create new time entry
  - Body: `{ conservateeId, date, startTime, endTime, description, category }`
  - Returns: `TimeEntry`
  - Status: 200 (success), 400 (invalid data)

- `PUT /api/time-entries/:id` - Update existing time entry
  - Body: `Partial<TimeEntryData>`
  - Returns: `TimeEntry`
  - Status: 200 (success), 400 (invalid data), 404 (not found)

- `DELETE /api/time-entries/:id` - Delete time entry
  - Returns: `{ message: "Time entry deleted" }`
  - Status: 200 (success), 404 (not found), 500 (server error)

## Route Issues Identified

### Current Problems
1. **Time Tracking Route**: Navigation to `/time-tracking` works but may have state management issues
2. **Browser Back Button**: No proper history handling, pages don't refresh correctly
3. **Authentication State**: Mock authentication doesn't persist across page refreshes
4. **Error Handling**: Inconsistent error responses and status codes

### Routing Dependencies
- **Frontend**: Wouter for client-side routing
- **Backend**: Express.js with manual route definitions
- **State**: TanStack Query for server state, React hooks for local state

## Future Route Considerations
- Protected route middleware for authentication checks
- Dynamic routes for individual conservatee/time entry pages
- API versioning strategy
- Rate limiting and security headers