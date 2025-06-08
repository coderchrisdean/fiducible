# Features Backlog

## Priority 1: Core Infrastructure
- ✅ User Authentication (Email/Password)
- ✅ Dashboard Layout & Navigation
- ✅ Time Entry Management
- ✅ Conservatee Management

## Priority 2: Core Features

### ✅ Email Verification & Resend
- **Status**: Completed
- **Description**: Complete email verification flow with Resend API integration
- **Features**:
  - Email verification on signup with 24-hour token expiration
  - Resend functionality with 60-second rate limiting
  - Verification success/error handling
  - Email verification status tracking in user profile
- **Estimated effort**: 6-8 hours
- **Implementation**: 
  - EmailVerification table with token-based validation
  - Resend API integration for transactional emails
  - Frontend verification page and resend UI components
  - Rate limiting and error handling

### ✅ User Profiles & Invitations
- **Status**: Completed
- **Description**: Global role system and case-based role management with invitation system
- **Features**:
  - Global role system (admin, conservator, attorney, observer)
  - Case-based role management with granular permissions
  - Invitation system for case collaboration
  - Profile management interface with tabbed sections
  - Role-based navigation and feature visibility
  - Case invitation emails with 7-day expiration
- **Estimated effort**: 12-15 hours
- **Implementation**:
  - Extended User model with globalRole field
  - Added Case, CaseRole, UserCaseRole, and CaseInvitation tables
  - Profile API endpoints (GET/PUT /api/profile)
  - Case invitation endpoints with email integration
  - Comprehensive profile page with security settings
  - Navigation integration with profile dropdown

## Priority 3: Advanced Features

### Financial Management
- **Priority**: 3
- **Description**: Track and manage conservatee financial transactions
- **Features**:
  - Income and expense tracking
  - Bank account integration
  - Financial reports and summaries
  - Court reporting templates
- **Estimated effort**: 15-20 hours

### Document Management
- **Priority**: 3
- **Description**: Store and organize case-related documents
- **Features**:
  - File upload and storage
  - Document categorization
  - Version control
  - Secure sharing with case collaborators
- **Estimated effort**: 10-12 hours

### Calendar & Scheduling
- **Priority**: 3
- **Description**: Schedule and track important dates and appointments
- **Features**:
  - Court date tracking
  - Appointment scheduling
  - Deadline reminders
  - Calendar integration
- **Estimated effort**: 8-10 hours

### Reporting & Analytics
- **Priority**: 3
- **Description**: Generate comprehensive reports for court and administrative purposes
- **Features**:
  - Time tracking reports
  - Financial summaries
  - Case status reports
  - Export to PDF/Excel
- **Estimated effort**: 12-15 hours

### Mobile Application
- **Priority**: 4
- **Description**: Mobile app for on-the-go access
- **Features**:
  - React Native mobile app
  - Offline time tracking
  - Photo capture for receipts
  - Push notifications
- **Estimated effort**: 25-30 hours

### API & Integrations
- **Priority**: 4
- **Description**: Third-party integrations and public API
- **Features**:
  - Banking API integration
  - Calendar service integration
  - Public REST API
  - Webhook support
- **Estimated effort**: 15-20 hours

## Feature Status Legend
- ✅ Completed
- 🔄 In Progress
- ⏳ Planned
- 🚫 Blocked
- 💡 Proposed