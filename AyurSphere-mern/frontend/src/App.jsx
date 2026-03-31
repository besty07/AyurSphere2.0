import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import PortalPage from './pages/PortalPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import PlantDetailPage from './pages/PlantDetailPage.jsx';
import { getUser } from './api/client.js';

const ProtectedRoute = ({ children }) => {
  const user = getUser();
  if (!user) {
    return <Navigate to="/portal" replace />;
  }
  return children;
};

const App = () => {
  const [user, setUser] = useState(getUser());

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/portal" element={<PortalPage />} />
      <Route path="/login" element={<LoginPage onAuth={setUser} />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage user={user} onUserChange={setUser} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/favorites"
        element={
          <ProtectedRoute>
            <FavoritesPage user={user} onUserChange={setUser} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plant/:id"
        element={
          <ProtectedRoute>
            <PlantDetailPage user={user} onUserChange={setUser} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/portal" />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
