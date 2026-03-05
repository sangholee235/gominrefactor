import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type ProtectedRouteProps = { children: ReactNode };

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const DEMO_MODE =
    (import.meta as any).env?.VITE_DISABLE_AUTH === "true" ||
    (import.meta as any).env?.VITE_DEMO_MODE === "true";
  if (DEMO_MODE) {
    return <>{children}</>;
  }

  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
