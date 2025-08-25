import CreateChatbotPage from "./pages/create";
import ViewChatbotPage from "./pages/view";
import ViewAllChatbotPage from "./pages/view-all";

export const chatbotsUrl = {
  viewAll: "/chatbots",
  create: "/chatbots/create",
  view: (id: string) => `/chatbots/${id}`,
};

export const chatbotsRoutes = [
  {
    path: chatbotsUrl.viewAll,
    element: <ViewAllChatbotPage />,
    meta: { access: "private" },
  },
  {
    path: chatbotsUrl.create,
    element: <CreateChatbotPage />,
    meta: { access: "private" },
  },
  {
    path: chatbotsUrl.view(":id"),
    element: <ViewChatbotPage />,
    meta: { access: "private" },
  },
];
