import { Navigate } from "react-router";
import { useAuth } from "../../lib/AuthContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  if (loading) return null; // or a spinner
  if (!session) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}