import { AuthUrl } from "@/auth/routes";
import { selectIsAuthenticated } from "@/auth/state/selectors";
import { useSelector } from "react-redux";
import { Navigate, useMatches } from "react-router-dom";
import { AccessLevel } from "../models/enums";

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const matches = useMatches();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  const matchedRoute = [...matches]
    .reverse()
    .find((m) => (m as any).meta?.access);
  const access = (matchedRoute as any)?.meta?.access;

  const isPublicRoute = access === AccessLevel.Public;
  const isOnboardingRoute = access === AccessLevel.Onboarding;

  if (isAuthenticated && !isOnboardingRoute) {
    return <Navigate to={AuthUrl.onboarding} replace />;
  } else if (isAuthenticated && (isPublicRoute || isOnboardingRoute)) {
    return <Navigate to="/" replace />;
  } else if (!isAuthenticated && !isPublicRoute) {
    return <Navigate to={AuthUrl.login} replace />;
  }

  return <>{children}</>;
};
