import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import type { Role } from "../api/auth";
import Spinner from "../components/ui/Spinner";

export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <div className="min-h-[50vh] grid place-items-center text-white/70"><Spinner /></div>;
  if (!user) return <Navigate to={`/login?returnTo=${encodeURIComponent(loc.pathname)}`} replace />;

  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  const loc = useLocation();
  const params = new URLSearchParams(loc.search);
  const returnTo = params.get("returnTo") || "/";

  if (loading) return <div className="min-h-[50vh] grid place-items-center text-white/70"><Spinner /></div>;
  if (user) return <Navigate to={returnTo} replace />;
  return <Outlet />;
}
