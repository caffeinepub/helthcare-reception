# Specification

## Summary
**Goal:** Stop the post-login onboarding guard from repeatedly showing the destructive “Unable to load your account” screen by making profile/onboarding status loading resilient with retries, backoff, and stable loading states.

**Planned changes:**
- Add automatic retry with short backoff for fetching the current user profile, keeping a non-destructive loading/connecting UI during retry attempts.
- Update `useOnboardingStatus` React Query configuration to enable reasonable retries/delays and ensure user-facing messages are generic English and do not instruct users to refresh.
- Gate onboarding/profile queries so they only run once the backend actor/access-control initialization is fully ready, preventing flicker and repeated error→retry loops.
- Ensure the destructive error screen appears only after retries are exhausted and includes a working retry action that triggers a refetch and can recover without a page refresh.

**User-visible outcome:** After logging in, users see a stable loading/connecting state while the app initializes and retries transient failures; the destructive error screen appears only if retries fully fail and provides a retry button that can recover and continue onboarding without refreshing the page.
