import { IMessageResponse } from "@/common/models/types";
import api from "../../common/services/api";
import {
  IChangePasswordSchema,
  IForgotPasswordSchema,
  ILoginSchema,
  IResetPasswordSchema,
  ISignupSchema,
} from "../models/schema";
import { IUser } from "../models/types";

export const AuthApi = {
  signup: async (data: ISignupSchema): Promise<{ user: IUser }> => {
    const response = await api.post("/auth/signup", data);
    return response.data;
  },

  login: async (data: ILoginSchema): Promise<{ user: IUser }> => {
    const response = await api.post("/auth/login", data);
    return response.data;
  },

  getProfile: async (): Promise<{ user: IUser }> => {
    const response = await api.get("/auth/profile");
    return response.data;
  },

  updateProfile: async (data: Partial<IUser>): Promise<IUser> => {
    const response = await api.put("/auth/me", data);
    return response.data;
  },

  deactivateAccount: async (): Promise<IMessageResponse> => {
    const response = await api.delete("/auth/me");
    return response.data;
  },

  logout: async (): Promise<IMessageResponse> => {
    const response = await api.post("/auth/logout");
    return response.data;
  },

  forgotPassword: async (data: IForgotPasswordSchema): Promise<IMessageResponse> => {
    const response = await api.post("/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (token: string, data: IResetPasswordSchema): Promise<IMessageResponse> => {
    const response = await api.post("/auth/reset-password", { token, ...data });
    return response.data;
  },

  verifyEmail: async (token: string) => {
    const response = await api.post("/auth/verify-email", { token });
    return response.data;
  },

  resendVerificationEmail: async (email: string) => {
    const response = await api.post("/auth/resend-verification-email", { email });
    return response.data;
  },

  changePassword: async (data: IChangePasswordSchema): Promise<IMessageResponse> => {
    const response = await api.post("/auth/change-password", data);
    return response.data;
  },
};
