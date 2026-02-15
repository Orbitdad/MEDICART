import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

import LoadingScreen from "./LoadingScreen.jsx";

function ProtectedRoute({ allowedRoles, redirectTo = "/" }) {
  const { token, role, loading } = useAuth();

  // Wait until auth state is resolved
  if (loading || token === undefined) {
    return <LoadingScreen />;
  }

  // Not logged in
  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  // Role mismatch
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
