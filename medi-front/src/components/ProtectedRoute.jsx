import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function ProtectedRoute({ allowedRoles, redirectTo = "/" }) {
  const { token, role } = useAuth();

  // Wait until auth state is resolved
  if (token === undefined) {
    return null;
  }

  // Not logged in
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  // Role mismatch
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
