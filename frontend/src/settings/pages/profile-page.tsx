import { selectUser } from "@/auth/state/selectors";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit, Loader2, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { IUpdateProfileSchema, updateProfileSchema } from "../models/schema";
import { useUpdateProfile } from "../services/hooks";

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);

  const user = useSelector(selectUser);
  const { mutate: mutateUpdateProfile, isPending } = useUpdateProfile();

  const form = useForm<IUpdateProfileSchema>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: "",
    },
  });

  // Update form values when profile data loads
  useEffect(() => {
    if (user) {
      form.reset({
        fullName: user.fullName || "",
      });
    }
  }, [user, form]);

  const handleSave = async (data: IUpdateProfileSchema) => {
    mutateUpdateProfile(data, {
      onSuccess: () => setIsEditing(false),
    });
  };

  const handleCancel = () => {
    form.reset({ fullName: user?.fullName || "" });
    setIsEditing(false);
  };

  return (
    <Card className="w-full md:w-1/2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-[6px]">
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your personal information and profile settings.</CardDescription>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={form.handleSubmit(handleSave)} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Full Name
            </Label>
            <Input
              id="fullName"
              type="text"
              {...form.register("fullName")}
              disabled={!isEditing}
              className={!isEditing ? "bg-muted" : ""}
            />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-500">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          {/* Email (read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email Address
            </Label>
            <Input id="email" type="email" value={user?.email || ""} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if you need to update your email.
            </p>
          </div>

          {/* Member Since */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Member Since</Label>
            <Input
              value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""}
              disabled
              className="bg-muted"
            />
          </div>

          {/* Last Login */}
          {user?.lastLogin && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Last Login</Label>
              <Input value={new Date(user.lastLogin).toLocaleString()} disabled className="bg-muted" />
            </div>
          )}

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfilePage;
