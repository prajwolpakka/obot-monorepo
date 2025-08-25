
import SubscriptionPage from "./pages/subscription";

export const subscriptionUrl = {
  subscription: "/subscription",
};

export const subscriptionRoutes = [
  {
    path: subscriptionUrl.subscription,
    element: <SubscriptionPage />,
    meta: { access: "private" },
  },
];
