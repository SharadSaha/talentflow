import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';

import { RouteErrorBoundary } from '@/components/errors/RouteErrorBoundary';
import { ROUTES } from '@/constants/routes';
import { USER_ROLE } from '@/constants/roles';
import { AuthLayout } from '@/layouts/AuthLayout';
import { CandidateLayout } from '@/layouts/CandidateLayout';
import { HRLayout } from '@/layouts/HRLayout';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { UnauthorizedPage } from '@/pages/UnauthorizedPage';
import { GuestRoute } from '@/routes/GuestRoute';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RoleRoute } from '@/routes/RoleRoute';
import { RootLayout } from '@/routes/RootLayout';

// Route-based code splitting keeps heavy chunks (landing + Framer Motion, auth
// and portal pages) out of the initial bundle. Suspense boundaries live in
// RootLayout.
const LandingPage = lazy(() => import('@/features/landing/pages/LandingPage'));
const CandidateLoginPage = lazy(() => import('@/features/auth/pages/CandidateLoginPage'));
const CandidateRegisterPage = lazy(() => import('@/features/auth/pages/CandidateRegisterPage'));
const HrLoginPage = lazy(() => import('@/features/auth/pages/HrLoginPage'));
const HrRegisterPage = lazy(() => import('@/features/auth/pages/HrRegisterPage'));

const CandidateDashboardPage = lazy(
  () => import('@/features/dashboard/pages/CandidateDashboardPage'),
);
const BrowseJobsPage = lazy(() => import('@/features/jobs/pages/BrowseJobsPage'));
const JobDetailsPage = lazy(() => import('@/features/jobs/pages/JobDetailsPage'));
const AppliedJobsPage = lazy(() => import('@/features/applications/pages/AppliedJobsPage'));
const CandidateProfilePage = lazy(() => import('@/features/profile/pages/CandidateProfilePage'));

const CandidateSettingsPage = lazy(() => import('@/features/settings/pages/CandidateSettingsPage'));

const HrDashboardPage = lazy(() => import('@/features/hr/pages/HrDashboardPage'));
const JobsManagementPage = lazy(() => import('@/features/hr/pages/JobsManagementPage'));
const CreateJobPage = lazy(() => import('@/features/hr/pages/CreateJobPage'));
const EditJobPage = lazy(() => import('@/features/hr/pages/EditJobPage'));
const ApplicantsPage = lazy(() => import('@/features/hr/pages/ApplicantsPage'));
const HrProfilePage = lazy(() => import('@/features/hr/pages/HrProfilePage'));
const HrSettingsPage = lazy(() => import('@/features/settings/pages/HrSettingsPage'));

/**
 * Application route tree. Structure, not features: the public landing page, auth
 * and role guards, and role-namespaced authenticated areas (`/candidate`,
 * `/hr`).
 *
 * Child paths are RELATIVE and each authenticated area is a `path`-prefixed
 * layout route — the idiomatic React Router shape. (Absolute paths nested under
 * pathless layout routes mis-rank against the public index and must be avoided.)
 * Each authenticated route carries a `handle.title` so breadcrumbs stay in sync
 * with routing.
 */
export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      // Public landing (self-contained: its own nav + footer)
      { index: true, element: <LandingPage /> },

      // Guest-only, role-specific auth
      {
        element: <GuestRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: 'auth/candidate/login', element: <CandidateLoginPage /> },
              { path: 'auth/candidate/register', element: <CandidateRegisterPage /> },
              { path: 'auth/hr/login', element: <HrLoginPage /> },
              { path: 'auth/hr/register', element: <HrRegisterPage /> },
              // Legacy paths → candidate flow (the primary self-service audience).
              {
                path: 'login',
                element: <Navigate to={ROUTES.AUTH.CANDIDATE_LOGIN} replace />,
              },
              {
                path: 'register',
                element: <Navigate to={ROUTES.AUTH.CANDIDATE_REGISTER} replace />,
              },
            ],
          },
        ],
      },

      // Authenticated
      {
        element: <ProtectedRoute />,
        children: [
          // Candidate area
          {
            element: <RoleRoute allowedRoles={[USER_ROLE.CANDIDATE]} />,
            children: [
              {
                path: 'candidate',
                element: <CandidateLayout />,
                children: [
                  { index: true, element: <Navigate to="dashboard" replace /> },
                  {
                    path: 'dashboard',
                    handle: { title: 'Career Hub' },
                    element: <CandidateDashboardPage />,
                  },
                  {
                    path: 'jobs',
                    handle: { title: 'Browse Jobs' },
                    element: <BrowseJobsPage />,
                  },
                  {
                    path: 'jobs/:id',
                    handle: { title: 'Job Details' },
                    element: <JobDetailsPage />,
                  },
                  {
                    path: 'applications',
                    handle: { title: 'My Applications' },
                    element: <AppliedJobsPage />,
                  },
                  {
                    path: 'profile',
                    handle: { title: 'Profile' },
                    element: <CandidateProfilePage />,
                  },
                  {
                    path: 'settings',
                    handle: { title: 'Settings' },
                    element: <CandidateSettingsPage />,
                  },
                ],
              },
            ],
          },

          // HR area
          {
            element: <RoleRoute allowedRoles={[USER_ROLE.HR]} />,
            children: [
              {
                path: 'hr',
                element: <HRLayout />,
                children: [
                  { index: true, element: <Navigate to="dashboard" replace /> },
                  {
                    path: 'dashboard',
                    handle: { title: 'Hiring Hub' },
                    element: <HrDashboardPage />,
                  },
                  { path: 'jobs', handle: { title: 'Jobs' }, element: <JobsManagementPage /> },
                  {
                    path: 'jobs/new',
                    handle: { title: 'Create Job' },
                    element: <CreateJobPage />,
                  },
                  {
                    path: 'jobs/:id/edit',
                    handle: { title: 'Edit Job' },
                    element: <EditJobPage />,
                  },
                  {
                    path: 'applicants',
                    handle: { title: 'Applicants' },
                    element: <ApplicantsPage />,
                  },
                  { path: 'profile', handle: { title: 'Profile' }, element: <HrProfilePage /> },
                  {
                    path: 'settings',
                    handle: { title: 'Settings' },
                    element: <HrSettingsPage />,
                  },
                ],
              },
            ],
          },
        ],
      },

      // System
      { path: 'unauthorized', element: <UnauthorizedPage /> },
      { path: '404', element: <NotFoundPage /> },
      { path: '*', element: <Navigate to={ROUTES.NOT_FOUND} replace /> },
    ],
  },
];
