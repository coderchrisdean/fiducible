# Fiducible Fix Plan & Implementation Guide

## Current Issues Identified

### 1. Time Tracking Route Issues
- **Status**: Route exists but may have data refresh issues
- **Files**: `client/src/App.tsx`, `client/src/pages/time-tracking.tsx`, `server/routes.ts`
- **Issues**: Browser back button not refreshing data properly

### 2. Document Upload Functionality
- **Status**: Frontend component exists but backend endpoint missing
- **Files**: `client/src/components/document-upload.tsx`, `server/routes.ts`
- **Issues**: Upload endpoint `/api/cases/:caseId/documents/upload` not implemented

### 3. Email Verification with Resend
- **Status**: Basic structure exists but missing Resend API key and resend functionality
- **Files**: `server/emailService.ts`, `client/src/pages/verify-email.tsx`, `server/routes.ts`
- **Issues**: Missing RESEND_API_KEY, no "Resend Email" button on frontend

### 4. Console Logging & Documentation
- **Status**: Minimal logging exists
- **Files**: Various across frontend and backend
- **Issues**: Need comprehensive logging for debugging

## Fix Implementation Plan

### Phase 1: Time Tracking Route Fix (30 minutes)
**Priority**: High
**Files to modify**:
- `client/src/App.tsx` - Add navigation logging
- `client/src/pages/time-tracking.tsx` - Add route entry/exit logs
- `server/routes.ts` - Add API endpoint logging

**Tasks**:
- [x] Add console.log on route entry in time-tracking page
- [x] Add browser back button refresh logic with logging
- [x] Add API request/response logging for time entries
- [x] Test route navigation and data refresh

### Phase 2: Document Upload Fix (45 minutes)
**Priority**: High
**Files to modify**:
- `server/routes.ts` - Add document upload endpoints
- `server/fileStorage.ts` - Verify file storage implementation
- `client/src/components/document-upload.tsx` - Add error logging

**Tasks**:
- [ ] Implement `/api/cases/:caseId/documents/upload` endpoint
- [ ] Add document CRUD endpoints
- [ ] Add comprehensive error logging
- [ ] Test file upload functionality

### Phase 3: Email Verification & Resend Integration (45 minutes)
**Priority**: Medium
**Files to modify**:
- `server/emailService.ts` - Add logging and error handling
- `client/src/pages/verify-email.tsx` - Add resend button
- `client/src/pages/signup.tsx` - Add resend option
- `server/routes.ts` - Add email resend logging

**Tasks**:
- [ ] Request RESEND_API_KEY from user
- [ ] Add "Resend Email" button to verify-email page
- [ ] Add comprehensive email logging
- [ ] Test email sending and verification flow

### Phase 4: Comprehensive Logging (30 minutes)
**Priority**: Medium
**Files to modify**:
- All major components and API routes

**Tasks**:
- [ ] Add logging to all major user actions
- [ ] Add API request/response logging
- [ ] Create `consolelog.md` documentation
- [ ] Add error boundary logging

## Logging Strategy

### Frontend Logging Points
- Route navigation entry/exit
- Form submissions (start/success/error)
- API request/response cycles
- User interaction events
- Error boundary catches

### Backend Logging Points
- API endpoint entry/exit
- Database operations
- Email sending attempts
- File upload progress
- Authentication events

### Log Format
```javascript
console.log('[COMPONENT/ROUTE] [ACTION] [TIMESTAMP] Message', data);
```

Example:
```javascript
console.log('[TimeTracking] [ROUTE_ENTRY] [' + new Date().toISOString() + '] Entering time tracking page');
```

## Success Criteria

### Phase 1 Complete When:
- Time tracking route loads without errors
- Browser back button properly refreshes data
- All route transitions are logged
- Time entry CRUD operations work correctly

### Phase 2 Complete When:
- Document upload endpoint accepts files
- File storage works correctly
- Upload progress and errors are logged
- Document listing shows uploaded files

### Phase 3 Complete When:
- RESEND_API_KEY is configured
- Email verification emails send successfully
- "Resend Email" functionality works
- All email operations are logged

### Phase 4 Complete When:
- All major user actions are logged
- `consolelog.md` documents all log points
- Error handling is comprehensive
- Debugging information is easily accessible

## File Impact Summary

**High Impact (Core Changes)**:
- `server/routes.ts` - Document endpoints, logging
- `client/src/App.tsx` - Navigation logging
- `client/src/pages/time-tracking.tsx` - Route logging
- `server/emailService.ts` - Email logging

**Medium Impact (UI/UX)**:
- `client/src/pages/verify-email.tsx` - Resend button
- `client/src/pages/signup.tsx` - Resend functionality
- `client/src/components/document-upload.tsx` - Error logging

**Low Impact (Documentation)**:
- `consolelog.md` - New file
- `FIX_PLAN.md` - This file

## Implementation Notes

- Start with Phase 1 as it's critical for basic functionality
- Request RESEND_API_KEY early in Phase 3
- Test each phase before moving to the next
- Document all logging points as they're added
- Use consistent logging format across all files