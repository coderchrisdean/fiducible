# Fiducible Console Logging Documentation

## Overview
This document outlines all console logging points implemented across the Fiducible application for debugging and monitoring purposes.

## Logging Format
All logs follow the format: `[COMPONENT/ROUTE] [ACTION] [TIMESTAMP] Message`

Example: `[TimeTracking] [ROUTE_ENTRY] [2025-01-08T10:30:15.123Z] Entering time tracking page`

## Frontend Logging Points

### Router & Navigation (`client/src/App.tsx`)
- **[Router] [NAVIGATION]** - Logs when location changes
- **[Router] [BACK_BUTTON]** - Logs when browser back button is pressed
- **[Router] [REFETCH]** - Logs when queries are refetched due to navigation
- **[Router] [CLEANUP]** - Logs when navigation listeners are cleaned up

### Time Tracking Page (`client/src/pages/time-tracking.tsx`)
- **[TimeTracking] [ROUTE_ENTRY]** - Logs when entering the time tracking page
- **[TimeTracking] [QUERY_SUCCESS]** - Logs successful data fetching for time entries and conservatees
- **[TimeTracking] [FORM_SUBMIT]** - Logs when time entry form is submitted

### Email Verification Page (`client/src/pages/verify-email.tsx`)
- **[VerifyEmail] [ROUTE_ENTRY]** - Logs when entering the email verification page
- **[VerifyEmail] [NAVIGATE]** - Logs navigation actions
- **[VerifyEmail] [RESEND_EMAIL]** - Logs resend email attempts and results

### Document Upload Component (`client/src/components/document-upload.tsx`)
- **[DocumentUpload] [COMPONENT_MOUNT]** - Logs when component mounts with case and folder info
- **[DocumentUpload] [FILE_DROP]** - Logs when files are dropped/selected
- **[DocumentUpload] [UPLOAD_START]** - Logs start of upload process
- **[DocumentUpload] [UPLOAD_SUBMIT]** - Logs when form data is submitted to server
- **[DocumentUpload] [UPLOAD_SUCCESS]** - Logs successful upload completion
- **[DocumentUpload] [UPLOAD_ERROR]** - Logs upload failures
- **[DocumentUpload] [CACHE_INVALIDATE]** - Logs when document cache is invalidated

## Backend Logging Points

### API Routes (`server/routes.ts`)

#### Time Entry Endpoints
- **[API] [GET_TIME_ENTRIES]** - Logs time entry retrieval requests
- **[API] [POST_TIME_ENTRIES]** - Logs time entry creation requests

#### Conservatee Endpoints
- **[API] [GET_CONSERVATEES]** - Logs conservatee retrieval requests

#### Document Endpoints
- **[API] [UPLOAD_DOCUMENTS]** - Logs document upload requests and processing
- **[API] [GET_DOCUMENTS]** - Logs document listing requests

#### Email Endpoints
- **[API] [RESEND_EMAIL]** - Logs email resend requests and processing

### Email Service (`server/emailService.ts`)
- **[EmailService] [SEND_VERIFICATION]** - Logs verification email sending attempts
- **[EmailService] [SEND_VERIFICATION]** - Logs successful email sends with IDs
- **[EmailService] [SEND_VERIFICATION]** - Logs email sending failures

## Log Categories by Purpose

### User Actions
- Route navigation and page entry
- Form submissions
- File uploads and selections
- Button clicks and interactions

### System Operations
- Database queries and results
- API request/response cycles
- Cache invalidation and refetching
- Email sending operations

### Error Handling
- Validation failures
- Upload errors
- Network request failures
- Email sending failures

### Performance Monitoring
- Component mount/unmount
- Query execution timing
- File processing progress

## Debugging Scenarios

### Time Tracking Issues
1. Check **[TimeTracking] [ROUTE_ENTRY]** for page load
2. Verify **[TimeTracking] [QUERY_SUCCESS]** for data loading
3. Monitor **[API] [GET_TIME_ENTRIES]** for backend requests
4. Watch **[TimeTracking] [FORM_SUBMIT]** for form interactions

### Document Upload Problems
1. Look for **[DocumentUpload] [COMPONENT_MOUNT]** to confirm component initialization
2. Check **[DocumentUpload] [FILE_DROP]** for file selection
3. Monitor **[DocumentUpload] [UPLOAD_START]** through **[UPLOAD_SUCCESS/ERROR]** for upload flow
4. Verify **[API] [UPLOAD_DOCUMENTS]** for server-side processing

### Document Management System
1. **Document Upload Success**: `[DocumentUpload] [UPLOAD_SUCCESS] ownerId: ${ownerId}, caseId: ${caseId}, documentId: ${documentId}`
2. **Document Access Grant**: `[DocumentAccess] [GRANT_ACCESS] documentId: ${documentId}, grantedTo: ${userId}, grantedBy: ${ownerId}`
3. **Document Access Revoke**: `[DocumentAccess] [REVOKE_ACCESS] documentId: ${documentId}, revokedFrom: ${userId}, revokedBy: ${ownerId}`
4. **Document Download Access**: `[DocumentDownload] [ACCESS_LOG] documentId: ${documentId}, userId: ${userId}, ownerId: ${ownerId}`

### Email Verification Issues
1. Check **[VerifyEmail] [ROUTE_ENTRY]** for page access
2. Monitor **[API] [RESEND_EMAIL]** for resend requests
3. Verify **[EmailService] [SEND_VERIFICATION]** for email service calls

### Navigation and Browser Back Button
1. Monitor **[Router] [NAVIGATION]** for route changes
2. Check **[Router] [BACK_BUTTON]** for back button detection
3. Verify **[Router] [REFETCH]** for data refresh on navigation

## Implementation Status

### ✅ Completed Logging
- Router navigation and back button handling
- Time tracking page entry and data loading
- Document upload component lifecycle
- Email verification and resend functionality
- API endpoints for core operations
- Email service operations

### 🔄 Additional Logging Areas (Future)
- Authentication flows
- Error boundary catches
- Performance metrics
- User session management
- Database operation timing

## Usage Guidelines

### For Developers
- Use browser console to monitor frontend actions
- Check server logs for backend operations
- Filter logs by component/route for focused debugging
- Look for timestamp patterns to identify performance issues

### For Debugging
- Start with route entry logs to confirm page loads
- Follow the data flow from frontend to backend
- Check for error logs when operations fail
- Monitor success logs to confirm proper operation

## Log Level Recommendations

### Production
- Keep error logs enabled
- Disable verbose debug logs
- Monitor critical user actions only

### Development
- Enable all logging levels
- Use timestamp filtering for performance analysis
- Monitor component lifecycle for optimization

### Testing
- Focus on error and success logs
- Track user interaction flows
- Verify API request/response cycles