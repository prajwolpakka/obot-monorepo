import ChatLayout from "./components/chat-layout";
import ChatDetailPage from "./pages/chat-detail";
import ChatIndexPage from "./pages/chat-index";

export const chatUrl = {
  chat: "/chat",
  chatDetail: "/chat/:id",
};

export const chatRoutes = [
  {
    path: chatUrl.chat,
    element: <ChatLayout />,
    meta: { access: "private" },
    children: [
      {
        index: true,
        element: <ChatIndexPage />,
      },
      {
        path: ":id",
        element: <ChatDetailPage />,
      },
    ],
  },
];
