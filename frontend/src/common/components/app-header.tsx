import { useLogout } from "@/auth/services/hooks";
import { selectUser } from "@/auth/state/selectors";
import { Avatar, AvatarFallback } from "@/common/components/ui/avatar";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/common/state/hooks";
import { settingsUrl } from "@/settings/routes";
import { selectDarkMode } from "@/settings/state/selectors";
import { toggleDarkMode } from "@/settings/state/slice";
import { Key, LogOut, Moon, PanelLeft, PanelRight, Sun, User } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { NotificationBell } from "../../notifications";
import { getInitials } from "../utils/strings";
import { useSidebar } from "./ui/sidebar";

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const user = useSelector(selectUser);
  const isDarkMode = useAppSelector(selectDarkMode);

  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const handleLogout = () => logout();
  const handleToggleDarkMode = () => dispatch(toggleDarkMode());

  const { open, setOpen } = useSidebar();

  const toggleSidebar = () => setOpen(!open);

  return (
    <div className="border-b border-border bg-background supports-[backdrop-filter]:bg-background/80 backdrop-blur flex items-center justify-between px-4 py-[6px] z-10">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="mr-2"
          aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
        >
          {open ? <PanelRight className="h-5 w-5" /> : <PanelLeft className="h-5 w-5" />}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <NotificationBell />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleToggleDarkMode}
          className="rounded-full "
          disabled={isLoggingOut}
        >
          {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

        {/* User Account */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild disabled={isLoggingOut}>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs uppercase">
                  {getInitials(user?.fullName ?? "")}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.fullName}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate(settingsUrl.profile)} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate(settingsUrl.security)} className="cursor-pointer">
              <Key className="mr-2 h-4 w-4" />
              <span>Change Password</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default AppHeader;
