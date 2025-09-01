import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Label } from "@/common/components/ui/label";
import { Switch } from "@/common/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Bell } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { usePreferences, useUpdatePreferences } from "../services/hooks";

const preferencesSchema = z.object({
  emailNotifications: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

const PreferencesPage = () => {
  const { data: preferences, error } = usePreferences();
  const updatePreferencesMutation = useUpdatePreferences();

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
    },
  });

  // Update form when preferences load
  useEffect(() => {
    if (preferences) {
      form.reset({
        emailNotifications: preferences.emailNotifications ?? true,
        pushNotifications: preferences.pushNotifications ?? false,
      });
    }
  }, [preferences, form]);

  const handleUpdate = async <K extends keyof PreferencesFormData>(field: K, value: boolean) => {
    const currentValues = form.getValues();
    const updatedData = { ...currentValues, [field]: value };

    // form.setValue(field, value);

    try {
      await updatePreferencesMutation.mutateAsync(updatedData);
    } catch {
      // Revert on error
      // form.setValue(field, currentValues[field] as boolean);
    }
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="w-full md:w-1/2">
          <CardContent className="flex items-center justify-center py-8">
            <span className="text-red-500">Failed to load preferences</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferences
          </CardTitle>
          <CardDescription>Customize your experience and notifications.</CardDescription>
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
                <Switch checked={field.value} onCheckedChange={(value) => handleUpdate("emailNotifications", value)} />
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
                <Switch checked={field.value} onCheckedChange={(value) => handleUpdate("pushNotifications", value)} />
              )}
            />
          </div>

          {/* Browser Permissions Note */}
          {form.watch("pushNotifications") && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> To receive push notifications, you'll need to allow notifications in your browser
                when prompted.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferencesPage;
