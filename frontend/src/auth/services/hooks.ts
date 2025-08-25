import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { IResetPasswordSchema } from "../models/schema";
import { resetAuthData, setUser } from "../state/slice";
import { AuthApi } from "./api";
import { useNavigate } from "react-router-dom";
import { AuthUrl } from "../routes";
import { useAppDispatch } from "@/common/state/hooks";

export const authKeys = {
  profile: ["auth", "profile"] as const,
};

export const useProfile = () => {
  return useQuery({
    queryKey: authKeys.profile,
    queryFn: AuthApi.getProfile,
    retry: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

  return useMutation({
    mutationFn: AuthApi.login,
    onSuccess: (data) => {
      dispatch(setUser(data.user));
      queryClient.invalidateQueries({ queryKey: authKeys.profile });
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: AuthApi.signup,
    retry: false,
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: AuthApi.logout,
    onSuccess: () => {
      dispatch(resetAuthData());
      queryClient.clear();
      navigate(AuthUrl.login, { replace: true });
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: AuthApi.verifyEmail,
  });
};

export const useResendVerificationEmail = () => {
  return useMutation({
    mutationFn: AuthApi.resendVerificationEmail,
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: AuthApi.forgotPassword,
  });
};

export const useResetPassword = (token: string) => {
  return useMutation({
    mutationFn: (data: IResetPasswordSchema) => AuthApi.resetPassword(token, data),
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: AuthApi.changePassword,
  });
};
