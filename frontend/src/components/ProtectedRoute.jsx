import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ role, children }) {
  const loggedInRole = localStorage.getItem("role");

  if (!loggedInRole) {
    return <Navigate to="/login" replace />;
  }

  if (loggedInRole !== role) {
    return <Navigate to="/login" replace />;
  }

  return children;
}