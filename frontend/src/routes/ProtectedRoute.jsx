
import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function ProtectedRoute({ allowedRoles }) {
  const location = useLocation();
  const token = localStorage.getItem("auth_token");

  let user = null;

  try {
    user = JSON.parse(
      localStorage.getItem("auth_user") || "null"
    );
  } catch {
    user = null;
  }

  // Belum login
  if (!token) {
    return (
      <Navigate
        to="/"
        replace
        state={{ from: location }}
      />
    );
  }

  // Periksa role jika route membatasi role tertentu
  if (allowedRoles && allowedRoles.length > 0) {
    const roleName =
      typeof user?.role === "string"
        ? user.role
        : user?.role?.name;

    if (!allowedRoles.includes(roleName)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
