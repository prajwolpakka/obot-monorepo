import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Label } from "@/common/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/common/components/ui/select";
import { Switch } from "@/common/components/ui/switch";
import { Globe, Bell, Loader2 } from "lucide-react";
import { usePreferences, useUpdatePreferences } from "../services/hooks";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

const preferencesSchema = z.object({
  language: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  timezone: z.string().optional(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

const PreferencesPage = () => {
  const { data: preferences, isLoading, error } = usePreferences();
  const updatePreferencesMutation = useUpdatePreferences();

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      language: 'en',
      theme: 'light',
      emailNotifications: true,
      pushNotifications: false,
      timezone: 'UTC',
    },
  });

  // Update form when preferences load
  useEffect(() => {
    if (preferences) {
      form.reset({
        language: preferences.language || 'en',
        theme: preferences.theme || 'light',
        emailNotifications: preferences.emailNotifications ?? true,
        pushNotifications: preferences.pushNotifications ?? false,
        timezone: preferences.timezone || 'UTC',
      });
    }
  }, [preferences, form]);

  const handleUpdate = async (field: keyof PreferencesFormData, value: any) => {
    const currentValues = form.getValues();
    const updatedData = { ...currentValues, [field]: value };
    
    form.setValue(field, value);
    
    try {
      await updatePreferencesMutation.mutateAsync(updatedData);
    } catch (error) {
      // Revert on error
      form.setValue(field, currentValues[field]);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="w-1/2">
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading preferences...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="w-1/2">
          <CardContent className="flex items-center justify-center py-8">
            <span className="text-red-500">Failed to load preferences</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Display & Language */}
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Display & Language
          </CardTitle>
          <CardDescription>Customize your experience with these settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Theme</Label>
            <Controller
              name="theme"
              control={form.control}
              render={({ field }) => (
                <Select 
                  value={field.value} 
                  onValueChange={(value) => handleUpdate('theme', value)}
                  disabled={updatePreferencesMutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Language</Label>
            <Controller
              name="language"
              control={form.control}
              render={({ field }) => (
                <Select 
                  value={field.value} 
                  onValueChange={(value) => handleUpdate('language', value)}
                  disabled={updatePreferencesMutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Timezone */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Timezone</Label>
            <Controller
              name="timezone"
              control={form.control}
              render={({ field }) => (
                <Select 
                  value={field.value} 
                  onValueChange={(value) => handleUpdate('timezone', value)}
                  disabled={updatePreferencesMutation.isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="America/New_York">Eastern Time</SelectItem>
                    <SelectItem value="America/Chicago">Central Time</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                    <SelectItem value="Europe/London">London</SelectItem>
                    <SelectItem value="Europe/Paris">Paris</SelectItem>
                    <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="w-1/2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure how you want to receive notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive updates and alerts via email</p>
            </div>
            <Controller
              name="emailNotifications"
              control={form.control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={(value) => handleUpdate('emailNotifications', value)}
                  disabled={updatePreferencesMutation.isPending}
                />
              )}
            />
          </div>

          {/* Push Notifications */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label className="text-sm font-medium">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive real-time notifications in your browser</p>
            </div>
            <Controller
              name="pushNotifications"
              control={form.control}
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={(value) => handleUpdate('pushNotifications', value)}
                  disabled={updatePreferencesMutation.isPending}
                />
              )}
            />
          </div>

          {/* Browser Permissions Note */}
          {form.watch('pushNotifications') && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> To receive push notifications, you'll need to allow notifications in your browser when prompted.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading indicator */}
      {updatePreferencesMutation.isPending && (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Saving changes...</span>
        </div>
      )}
    </div>
  );
};

export default PreferencesPage;
