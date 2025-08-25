import { IUser } from "@/auth/models/types";
import api from "@/common/services/api";
import { IUpdatePasswordSchema, IUpdatePreferencesSchema, IUpdateProfileSchema } from "../models/schema";

export const settingsApi = {
  // Profile
  getProfile: async () => {
    const response = await api.get("/settings/profile");
    return response.data;
  },

  updateProfile: async (props: IUpdateProfileSchema) => {
    const response = await api.put<IUser>("/settings/profile", props);
    return response.data;
  },

  // Preferences
  getPreferences: async () => {
    const response = await api.get("/settings/preferences");
    return response.data;
  },

  updatePreferences: async (props: IUpdatePreferencesSchema) => {
    const response = await api.put("/settings/preferences", props);
    return response.data;
  },

  // Security
  getSecuritySettings: async () => {
    const response = await api.get("/settings/security");
    return response.data;
  },

  updatePassword: async (props: IUpdatePasswordSchema) => {
    const response = await api.put("/settings/security", props);
    return response.data;
  },
};
