import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import { getUser } from './api/client.js';

const ProtectedRoute = ({ children }) => {
  const user = getUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage onAuth={setUser} />} />
      <Route
        path="/"
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
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
