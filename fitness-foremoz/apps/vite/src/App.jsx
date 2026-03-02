import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import WebLandingPage from './pages/WebLandingPage.jsx';
import AccountPublicPage from './pages/AccountPublicPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import SignInPage from './pages/SignInPage.jsx';
import MemberSignUpPage from './pages/MemberSignUpPage.jsx';
import MemberPortalPage from './pages/MemberPortalPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import MemberPage from './pages/MemberPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import SalesPage from './pages/SalesPage.jsx';
import PtPage from './pages/PtPage.jsx';
import { getSession } from './lib.js';

function roleHome(role) {
  if (role === 'sales') return '/sales';
  if (role === 'pt') return '/pt';
  if (role === 'member') return '/member/portal';
  return '/dashboard';
}

function ProtectedRoute({ children }) {
  const location = useLocation();
  const session = getSession();

  if (!session?.isAuthenticated) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function RoleRoute({ roles, children }) {
  const session = getSession();
  if (!roles.includes(session?.role || 'admin')) {
    return <Navigate to={roleHome(session?.role)} replace />;
  }
  return children;
}

function RequireAdminOnboarding({ children }) {
  const session = getSession();
  const role = session?.role || 'admin';
  if (role === 'admin' && !session?.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

function OnboardingOnly() {
  const session = getSession();
  if (!session?.isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  if ((session?.role || 'admin') !== 'admin') {
    return <Navigate to={roleHome(session?.role)} replace />;
  }
  if (session?.isOnboarded) {
    return <Navigate to="/dashboard" replace />;
  }
  return <OnboardingPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/web" replace />} />
      <Route path="/web" element={<WebLandingPage />} />
      <Route path="/a/:account" element={<AccountPublicPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/member/signup" element={<MemberSignUpPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/onboarding" element={<OnboardingOnly />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['admin']}>
              <RequireAdminOnboarding>
                <DashboardPage />
              </RequireAdminOnboarding>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/admin"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['admin']}>
              <RequireAdminOnboarding>
                <AdminPage />
              </RequireAdminOnboarding>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/members/:memberId"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['admin', 'pt']}>
              <RequireAdminOnboarding>
                <MemberPage />
              </RequireAdminOnboarding>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['sales']}>
              <SalesPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/pt"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['pt']}>
              <PtPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/member/portal"
        element={
          <ProtectedRoute>
            <RoleRoute roles={['member']}>
              <MemberPortalPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/web" replace />} />
    </Routes>
  );
}
