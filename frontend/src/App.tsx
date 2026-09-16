import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import AppLayout from './layouts/AppLayout';
import DashboardPage from './pages/app/DashboardPage';
import TeammatesPage from './pages/app/TeammatesPage';
import TeamsPage from './pages/app/TeamsPage';
import MyTeamPage from './pages/app/MyTeamPage';
import NotificationsPage from './pages/app/NotificationsPage';
import ProfilePage from './pages/app/ProfilePage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected App Routes */}
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="teammates" element={<TeammatesPage />} />
          <Route path="teams" element={<TeamsPage />} />
          <Route path="my-team" element={<MyTeamPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="hackathons" element={<TeamsPage />} />
          <Route path="messages" element={<MyTeamPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
