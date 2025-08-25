import EmailVerified from "./pages/email-verified";
import ForgotPassword from "./pages/forgot-password";
import Login from "./pages/login";
import ResetPassword from "./pages/reset-password";
import Signup from "./pages/signup";
import VerifyAccountPage from "./pages/verify-account";
import VerifyAccountByToken from "./pages/verify-account-token";

export const AuthUrl = {
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  emailVerified: "/email-verified",
  unauthorized: "/unauthorized",
  googleSuccess: "/google/success",
  onboarding: "/onboarding",
  resetPassword: (token: string) => `/reset-password/${token}`,
  verifyAccount: (token: string) => `/verify-account/${token}`,
};

export const authRoutes = [
  { path: AuthUrl.login, element: <Login />, meta: { access: "public" } },
  { path: AuthUrl.signup, element: <Signup />, meta: { access: "public" } },
  {
    path: AuthUrl.forgotPassword,
    element: <ForgotPassword />,
    meta: { access: "public" },
  },
  {
    path: AuthUrl.resetPassword(":token"),
    element: <ResetPassword />,
    meta: { access: "public" },
  },
  {
    path: AuthUrl.verifyAccount(""),
    element: <VerifyAccountPage />,
    meta: { access: "private" },
  },
  {
    path: AuthUrl.verifyAccount(":token"),
    element: <VerifyAccountByToken />,
    meta: { access: "private" },
  },
  {
    path: AuthUrl.emailVerified,
    element: <EmailVerified />,
    meta: { access: "private" },
  },
];
