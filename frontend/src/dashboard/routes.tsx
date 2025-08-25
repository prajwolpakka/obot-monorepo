import DashboardPage from "./pages/dashboard";

export const dashboardUrl = {
	dashboard: "/dashboard",
};

export const dashboardRoutes = [
	{
		path: dashboardUrl.dashboard,
		element: <DashboardPage />,
		meta: { access: "private" },
	},
];
