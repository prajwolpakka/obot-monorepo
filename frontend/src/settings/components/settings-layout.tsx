import PageTitle from "@/common/components/page-title";
import { Card, CardContent } from "@/common/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { Globe, Shield, User } from "lucide-react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const SettingsLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes("/profile")) return "profile";
    if (path.includes("/security")) return "security";
    if (path.includes("/preferences")) return "preferences";
    return "profile";
  };

  const handleTabChange = (value: string) => {
    navigate(`/settings/${value}`);
  };

  return (
    <div className="p-4 h-full w-full overflow-hidden">
      <Card className="h-full flex flex-col">
        <CardContent className="p-6 flex flex-col h-full min-h-0">
          <div className="space-y-6 flex-1 flex flex-col min-h-0">
            <PageTitle title="Settings" description="Manage your account settings and preferences" />

            <div className="flex-1 min-h-0">
              <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="space-y-6 h-full flex flex-col">
                <TabsList className="w-fit">
                  <TabsTrigger
                    value="profile"
                    className="flex items-center gap-2 w-full justify-start sm:w-auto sm:justify-center">
                    <User className="h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger
                    value="security"
                    className="flex items-center gap-2 w-full justify-start sm:w-auto sm:justify-center">
                    <Shield className="h-4 w-4" />
                    Security
                  </TabsTrigger>
                  <TabsTrigger
                    value="preferences"
                    className="flex items-center gap-2 w-full justify-start sm:w-auto sm:justify-center">
                    <Globe className="h-4 w-4" />
                    Preferences
                  </TabsTrigger>
                </TabsList>

                <div className="flex-1 min-h-0 overflow-y-auto">
                  <Outlet />
                </div>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsLayout;
