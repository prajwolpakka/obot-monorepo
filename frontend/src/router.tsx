import { Toaster } from "@/common/components/ui/toaster";
import NotFound from "@/common/pages/NotFound";
import { useAppDispatch, useAppSelector } from "@/common/state/hooks";
import { Suspense, useEffect } from "react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import AuthGuard from "./auth/components/AuthGuard";
import { authRoutes, AuthUrl } from "./auth/routes";
import { useProfile } from "./auth/services/hooks";
import { setAuthData, resetAuthData } from "./auth/state/slice";
import { chatRoutes } from "./chat/routes";
import { chatbotsRoutes } from "./chatbots/routes";
import MainLayout from "./common/components/main-layout";
import SplashScreen from "./common/pages/SplashScreen";
import { dashboardRoutes } from "./dashboard/routes";
import { documentsRoutes } from "./documents/routes";
import { settingsRoutes } from "./settings/routes";
import { selectDarkMode } from "./settings/state/selectors";
import { subscriptionRoutes } from "./subscription/routes";

const routes = [
  {
    path: "/",
    element: <Navigate to={AuthUrl.login} replace />,
    meta: { access: "public" },
  },
  ...authRoutes,
  {
    element: (
      <AuthGuard requireAuth>
        <MainLayout />
      </AuthGuard>
    ),
    children: [
      ...dashboardRoutes,
      ...chatbotsRoutes,
      ...chatRoutes,
      ...documentsRoutes,
      ...settingsRoutes,
      ...subscriptionRoutes,
    ],
  },
  { path: "*", element: <NotFound /> },
];

const router = createBrowserRouter(routes);

const AppRouter = () => {
  const isDarkMode = useAppSelector(selectDarkMode);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  return (
    <Suspense fallback={<SplashScreen />}>
      <RouterProvider router={router} />
      <Toaster />
    </Suspense>
  );
};

export default AppRouter;
