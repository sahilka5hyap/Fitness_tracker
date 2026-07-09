import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import BottomNav from './components/BottomNav';

import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import Onboarding from './pages/Onboarding';
import Workouts   from './pages/Workouts';
import Nutrition  from './pages/Nutrition';
import AICoach    from './pages/AICoach';
import Profile    from './pages/Profile';
import BodyStats  from './pages/BodyStats';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const AppContent = () => {
  // ✅ FIX: Bring in needsOnboarding from AuthContext
  const { user, loading, needsOnboarding } = useContext(AuthContext);
  const { t } = useContext(ThemeContext);

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${t.pageBg}`}>
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#D4FF33] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className={t.subtext}>Loading...</p>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${t.pageBg} ${t.text}`}>
      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <Login />} />
        
        {/* ✅ FIX: If a user exists on the register page, check where they need to go */}
        <Route path="/register" element={user ? (needsOnboarding ? <Navigate to="/onboarding" /> : <Navigate to="/dashboard" />) : <Register />} />

        {/* Protected routes */}
        <Route path="/dashboard"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
        <Route path="/workouts"   element={<PrivateRoute><Workouts /></PrivateRoute>} />
        <Route path="/nutrition"  element={<PrivateRoute><Nutrition /></PrivateRoute>} />
        <Route path="/ai-coach"   element={<PrivateRoute><AICoach /></PrivateRoute>} />
        <Route path="/profile"    element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/body-stats" element={<PrivateRoute><BodyStats /></PrivateRoute>} />

        {/* ✅ FIX: Default route logic updated to handle onboarding check */}
        <Route path="/" element={<Navigate to={user ? (needsOnboarding ? '/onboarding' : '/dashboard') : '/login'} />} />
      </Routes>

      {user && <BottomNav />}
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}