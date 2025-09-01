import { SidebarProvider } from "@/common/components/ui/sidebar";
import React from "react";
import { Outlet } from "react-router-dom";
import AppHeader from "./app-header";
import AppSidebar from "./app-sidebar";

interface Props {
  padding?: number;
}
const MainLayout: React.FC<Props> = ({ padding = 4 }) => {
  return (
    <SidebarProvider defaultOpen>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar />

        <div className="relative h-full w-full flex flex-col">
          <AppHeader />

          <div className="flex-1 overflow-y-auto overflow-x-hidden bg-muted">
            <Outlet />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
