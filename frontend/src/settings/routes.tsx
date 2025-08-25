import SettingsLayout from "./components/settings-layout";
import PreferencesPage from "./pages/preferences-page";
import ProfilePage from "./pages/profile-page";
import SecurityPage from "./pages/security-page";
import SettingsIndexPage from "./pages/settings-index-page";

export const settingsUrl = {
  settings: "/settings",
  profile: "/settings/profile",
  security: "/settings/security",
  preferences: "/settings/preferences",
};

export const settingsRoutes = [
  {
    path: settingsUrl.settings,
    element: <SettingsLayout />,
    meta: { access: "private" },
    children: [
      {
        index: true,
        element: <SettingsIndexPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "security",
        element: <SecurityPage />,
      },
      {
        path: "preferences",
        element: <PreferencesPage />,
      },
    ],
  },
];
