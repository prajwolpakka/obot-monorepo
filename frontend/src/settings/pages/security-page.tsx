import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Lock, Shield } from "lucide-react";
import { useForm } from "react-hook-form";
import { IUpdatePasswordSchema, updatePasswordSchema } from "../models/schema";
import { useSecuritySettings, useUpdatePassword } from "../services/hooks";

const SecurityPage = () => {
  const { data: securitySettings, isLoading } = useSecuritySettings();
  const { mutate: mutateUpdatePassword, isPending } = useUpdatePassword();

  const form = useForm<IUpdatePasswordSchema>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const handlePasswordUpdate = async (data: IUpdatePasswordSchema) => {
    mutateUpdatePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => form.reset(),
      }
    );
  };

  if (isLoading) {
    return (
      <Card className="w-full md:w-1/2">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading security settings...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Overview
          </CardTitle>
          <CardDescription>Monitor your account security status.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {securitySettings?.lastPasswordChange && (
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label className="text-sm font-medium">Last Password Change</Label>
                <p className="text-sm text-muted-foreground">
                  {new Date(securitySettings.lastPasswordChange).toLocaleDateString()}
                </p>
              </div>
              <div className="text-green-600">
                <Shield className="h-5 w-5" />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="w-full md:w-1/2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>Update your password to keep your account secure.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handlePasswordUpdate)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword" className="text-sm font-medium">
                Current Password
              </Label>
              <Input id="currentPassword" type="password" {...form.register("currentPassword")} className="h-10" />
              {form.formState.errors.currentPassword && (
                <p className="text-sm text-red-500">{form.formState.errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium">
                New Password
              </Label>
              <Input id="newPassword" type="password" {...form.register("newPassword")} className="h-10" />
              {form.formState.errors.newPassword && (
                <p className="text-sm text-red-500">{form.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </Label>
              <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} className="h-10" />
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-500">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Password
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityPage;
