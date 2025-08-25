import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionApi } from "./api";

const SUBSCRIPTION_KEY = "subscription";

export const useSubscription = () => {
  return useQuery({
    queryKey: [SUBSCRIPTION_KEY],
    queryFn: subscriptionApi.get,
    retry: false,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_KEY] });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionApi.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_KEY] });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: subscriptionApi.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_KEY] });
    },
  });
};
