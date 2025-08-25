import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../../common/state/hooks";
import { AuthUrl } from "../routes";
import { selectIsAuthenticated } from "../state/selectors";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to={AuthUrl.login} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
