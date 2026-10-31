import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-neutral-50 text-sm text-neutral-500">
        Loading your workspace…
      </main>
    );
  }

  return token
    ? <Outlet />
    : <Navigate to="/login" replace state={{ from: location }} />;
}
