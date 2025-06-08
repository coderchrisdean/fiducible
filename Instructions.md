# Instructions.md - Fiducible App Rebranding & Updates

## Overview
This document outlines the rebranding from "Conservatorship Management Web App" to "Fiducible" and updates to time-tracking specifications.

## Checkpoint 1: Core Branding Updates (15 minutes)
**Effort:** Low
**Priority:** High

### Frontend Components to Update:
- [ ] `client/src/pages/landing.tsx` - Hero section title, app name in navigation
- [ ] `client/src/pages/login.tsx` - App logo and branding text
- [ ] `client/src/pages/signup.tsx` - App logo and branding text
- [ ] `client/src/components/layout.tsx` - Navigation header branding

### Text Replacements:
- "ConserveTrack" → "Fiducible"
- "Conservatorship Management" → "Fiduciary Management" 
- "conservatorship management platform" → "fiduciary management platform"

## Checkpoint 2: Time Tracking Logic Updates (20 minutes)
**Effort:** Medium
**Priority:** High

### Files to Modify:
- [ ] `client/src/pages/time-tracking.tsx`
  - Update `roundToTenMinutes` function from 1/6 hour to 0.1 hour increments
  - Change step value from 0.1667 to 0.1 in time input
  - Update minimum value to 0.1 (6 minutes)
  - Update placeholder and helper text

### Logic Changes:
- **Old:** `Math.round(hours * 6) / 6` (rounds to 10-minute increments as 0.1667h)
- **New:** `Math.round(hours * 10) / 10` (rounds to 6-minute increments as 0.1h)
- **Minimum Entry:** 0.1 hours (6 minutes)

## Checkpoint 3: Documentation & Comments (10 minutes)
**Effort:** Low
**Priority:** Medium

### Code Comments to Update:
- [ ] Time tracking utility function comments
- [ ] Form validation messages
- [ ] Component descriptions mentioning old increment logic

### Documentation Files:
- [ ] Update any inline comments referencing "1/6th hour" or "0.1667"
- [ ] Update form helper text and validation messages

## Checkpoint 4: Validation & Testing (15 minutes)
**Effort:** Low
**Priority:** Medium

### Verification Steps:
- [ ] Test time entry form with new minimum values
- [ ] Verify rounding logic works correctly
- [ ] Check all branding appears consistently
- [ ] Validate form submissions work with new time increments

## Implementation Order
1. **Checkpoint 1** - Update all branding elements first for visual consistency
2. **Checkpoint 2** - Modify time tracking logic and validation
3. **Checkpoint 3** - Clean up documentation and comments
4. **Checkpoint 4** - Test functionality end-to-end

## Total Estimated Effort: 60 minutes

## Key Changes Summary
- **App Name:** "ConserveTrack" → "Fiducible"
- **Time Increments:** 0.1667h (10-minute) → 0.1h (6-minute) minimum
- **Rounding Logic:** 1/6 hour precision → 1/10 hour precision
- **Branding Consistency:** All references updated across the application

## Files Requiring Updates
- Planning.md ✅ (completed)
- client/src/pages/landing.tsx
- client/src/pages/login.tsx  
- client/src/pages/signup.tsx
- client/src/components/layout.tsx
- client/src/pages/time-tracking.tsx

## Success Criteria
- All "ConserveTrack" references replaced with "Fiducible"
- Time tracking accepts minimum 6-minute entries
- Rounding logic uses 0.1-hour increments
- Application maintains full functionality
- No broken links or validation errors