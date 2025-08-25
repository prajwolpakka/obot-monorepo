import ObotLogoSmall from "@/common/assets/obot-logo-small.png";
import ObotLogo from "@/common/assets/obot-logo.png";
import { Separator } from "@/common/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/common/components/ui/sidebar";
import { Bot, CreditCard, FileText, Home, MessageSquare, Settings } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: Home },
  { path: "/chatbots", label: "Chatbots", icon: Bot },
  { path: "/chat", label: "Chats", icon: MessageSquare },
  { path: "/documents", label: "Documents", icon: FileText },
];

const footerItems: NavItem[] = [
  { path: "/settings", label: "Settings", icon: Settings },
  { path: "/subscription", label: "Subscription", icon: CreditCard },
];

const AppSidebar = () => {
  const location = useLocation();
  const { open } = useSidebar();

  return (
    <Sidebar className="h-full relative" resizable>
      <SidebarContent>
        <SidebarMenu>
          {open ? (
            <div className="py-1 px-4">
              <img src={ObotLogo} alt="Obot Logo" className="h-8" />
            </div>
          ) : (
            <div className="py-1 w-full flex justify-center">
              <img src={ObotLogoSmall} alt="Obot Logo" className="h-8" />
            </div>
          )}

          <Separator />

          {navItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton
                asChild
                isActive={
                  item.path === "/"
                    ? location.pathname === "/"
                    : location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path + "/"))
                }
                tooltip={item.label}
              >
                <NavLink to={item.path} end={item.path === "/"}>
                  <item.icon />
                  {open && <span>{item.label}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="px-0">
        <SidebarMenu>
          {footerItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild isActive={location.pathname === item.path} tooltip={item.label}>
                <NavLink to={item.path} end={item.path === "/"}>
                  <item.icon />
                  {open && <span>{item.label}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
