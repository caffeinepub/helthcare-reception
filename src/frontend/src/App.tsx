import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import WelcomePage from './pages/WelcomePage';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import RoleSelectionPage from './features/onboarding/RoleSelectionPage';
import LocationFormPage from './features/onboarding/LocationFormPage';
import JobSeekerApplyPage from './features/jobSeeker/JobSeekerApplyPage';
import JobSeekerHomePage from './features/jobSeeker/JobSeekerHomePage';
import RecruiterBrowsePage from './features/recruiter/RecruiterBrowsePage';
import { AuthProvider } from './features/auth/AuthContext';
import { BackendActorProvider } from './features/actor/BackendActorProvider';
import RequireAuth from './features/auth/RequireAuth';
import RequireOnboarding from './features/onboarding/RequireOnboarding';

const rootRoute = createRootRoute({
  component: () => (
    <AuthProvider>
      <BackendActorProvider>
        <Outlet />
      </BackendActorProvider>
    </AuthProvider>
  ),
});

const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: WelcomePage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const signupRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signup',
  component: SignupPage,
});

const roleSelectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding/role',
  component: () => (
    <RequireAuth>
      <RequireOnboarding step="role">
        <RoleSelectionPage />
      </RequireOnboarding>
    </RequireAuth>
  ),
});

const locationFormRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding/location',
  component: () => (
    <RequireAuth>
      <RequireOnboarding step="location">
        <LocationFormPage />
      </RequireOnboarding>
    </RequireAuth>
  ),
});

const jobSeekerApplyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/job-seeker/apply',
  component: () => (
    <RequireAuth>
      <RequireOnboarding step="complete">
        <JobSeekerApplyPage />
      </RequireOnboarding>
    </RequireAuth>
  ),
});

const jobSeekerHomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/job-seeker/home',
  component: () => (
    <RequireAuth>
      <RequireOnboarding step="complete">
        <JobSeekerHomePage />
      </RequireOnboarding>
    </RequireAuth>
  ),
});

const recruiterBrowseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/recruiter/browse',
  component: () => (
    <RequireAuth>
      <RequireOnboarding step="complete">
        <RecruiterBrowsePage />
      </RequireOnboarding>
    </RequireAuth>
  ),
});

const routeTree = rootRoute.addChildren([
  welcomeRoute,
  loginRoute,
  signupRoute,
  roleSelectionRoute,
  locationFormRoute,
  jobSeekerApplyRoute,
  jobSeekerHomeRoute,
  recruiterBrowseRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
