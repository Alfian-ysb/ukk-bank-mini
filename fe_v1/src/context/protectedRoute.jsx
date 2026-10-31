import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getRouteByRole, getStoredRole, isLoggedIn } from "./authSession";

function ProtectedRoute({ allowedRoles = [] }) {
  const location = useLocation();

  if (!isLoggedIn()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(getStoredRole())) {
    return <Navigate to={getRouteByRole(getStoredRole())} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
