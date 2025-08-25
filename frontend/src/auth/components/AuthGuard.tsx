import { useAppSelector } from "@/common/state/hooks";
import { Navigate, useLocation } from "react-router-dom";
import { selectIsAuthenticated } from "../state/selectors";
import { AuthUrl } from "../routes";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ children, requireAuth = true }: AuthGuardProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  // If user needs to be authenticated but isn't, redirect to login
  if (requireAuth && !isAuthenticated) {
    return <Navigate to={AuthUrl.login} state={{ from: location }} replace />;
  }

  // If user shouldn't be authenticated (on auth pages) but is, redirect to dashboard
  if (!requireAuth && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;