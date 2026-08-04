import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getRouteByRole, getStoredRole, isLoggedIn } from "./authSession";

const protectedRoute = ({ allowedRoles, redirectTo = "/login" }) => {
  const location = useLocation();
  const hasSession = isLoggedIn();

  if (!hasSession) {
    return <Navigate to={redirectTo} replace />;
  }

  if (!allowedRoles.length) {
    return <Outlet />;
  }

  const role = getStoredRole();
  const normalizedAllowedRoles = allowedRoles.map((item) =>
    String(item).toLowerCase(),
  );

  if (!normalizedAllowedRoles.includes(role)) {
    const roleHomePath = getRouteByRole(role);
    const fallbackPath =
      roleHomePath === location.pathname ? redirectTo : roleHomePath;
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default protectedRoute;
