import { Navigate, Route, Routes } from 'react-router-dom';
import WebLandingPage from './pages/WebLandingPage.jsx';
import SignUpPage from './pages/SignUpPage.jsx';
import SignInPage from './pages/SignInPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<WebLandingPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
