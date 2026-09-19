import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ allowedRole, children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user?.role !== allowedRole) {
    return (
      <Navigate
        to={user?.role === "admin" ? "/admin/sales" : "/add-sale"}
        replace
      />
    );
  }

  return children;
}