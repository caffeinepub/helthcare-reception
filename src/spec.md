# Specification

## Summary
**Goal:** Remove any incorrect UI messaging implying only admins can select a role, and ensure role selection/error handling messaging clearly supports all authenticated users during onboarding.

**Planned changes:**
- Audit and update frontend copy across screens/alerts/toasts/errors to remove any “only admins choose role” (or similar) wording and replace it with accurate English indicating any logged-in user can choose a role during onboarding.
- Update Role Selection page authorization/session failure handling to show a clear English message (no admin references) and provide a “Go to Login” action to re-authenticate.

**User-visible outcome:** During onboarding/first login, any authenticated user can select a role with correct English guidance, and if role selection fails due to an auth/session issue, the user is prompted to log in again via a clear message and a direct navigation action.
