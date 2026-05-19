import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/store/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { ready, userId, init } = useAuth();
  const location = useLocation();

  useEffect(() => {
    init();
  }, [init]);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Carregando...
      </div>
    );
  }
  if (!userId) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
