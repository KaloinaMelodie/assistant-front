// src/auth/ProtectedRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './components/auth/AuthContext';
import LoadingComponent from './components/element/LoadingComponent';

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingComponent
      height="calc(100dvh - var(--topbar-h, 0px))"
      label="Vérification de session…"
    />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }
  return children;
}
