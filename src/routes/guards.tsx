import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/store/auth";
import type { Role } from "@/types";

interface RequireAuthProps {
  roles?: Role[];
  children: ReactNode;
}

export function RequireAuth({ roles, children }: RequireAuthProps) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) {
    return <Navigate to="/connexion" state={{ from: location.pathname }} replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }
  return <>{children}</>;
}
