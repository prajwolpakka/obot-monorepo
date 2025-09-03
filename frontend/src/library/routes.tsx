import DocumentViewerPage from "./pages/view";
import ViewAllDocumentsPage from "./pages/view-all";

export const documentsUrl = {
  viewAll: "/documents",
  view: (id: string) => `/documents/${id}`,
};

export const documentsRoutes = [
  {
    path: documentsUrl.viewAll,
    element: <ViewAllDocumentsPage />,
    meta: { access: "private" },
  },
  {
    path: documentsUrl.view(":id"),
    element: <DocumentViewerPage />,
    meta: { access: "private" },
  },
];
