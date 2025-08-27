import { updateUserName } from "@/auth/state/slice";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { settingsApi } from "./api";

// Query Keys
export const SETTINGS_KEYS = {
  profile: ["settings", "profile"],
  preferences: ["settings", "preferences"],
  security: ["settings", "security"],
};

// Profile hooks
export const useProfile = () => {
  return useQuery({
    queryKey: SETTINGS_KEYS.profile,
    queryFn: settingsApi.getProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: settingsApi.updateProfile,
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.profile });
      dispatch(updateUserName({ fullName: user.fullName }));
      toast.success("Profile updated successfully");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });
};

// Preferences hooks
export const usePreferences = () => {
  return useQuery({
    queryKey: SETTINGS_KEYS.preferences,
    queryFn: settingsApi.getPreferences,
  });
};

export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.preferences });
      toast.success("Preferences updated successfully");
    },
    onError: () => {
      toast.error("Failed to update preferences");
    },
  });
};

// Security hooks
export const useSecuritySettings = () => {
  return useQuery({
    queryKey: SETTINGS_KEYS.security,
    queryFn: settingsApi.getSecuritySettings,
  });
};

export const useUpdatePassword = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updatePassword,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SETTINGS_KEYS.security });
      toast.success("Password updated successfully");
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Failed to update password";
      toast.error(message);
    },
  });
};
