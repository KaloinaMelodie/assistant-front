import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/app/notfound" replace />;
  }

  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  if (allowedRoles.includes(user.role)) {
    return children;
  }

  return <Navigate to="/app/notfound" replace />;
};

export default ProtectedRoute;
