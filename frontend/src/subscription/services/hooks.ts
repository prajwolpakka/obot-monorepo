import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionApi } from "./api";
import { useAppDispatch } from "@/common/state/hooks";
import { updateUserSubscription } from "@/auth/state/slice";

const SUBSCRIPTION_KEY = "subscription";
const PLANS_KEY = "subscription-plans";

export const useSubscription = () => {
  const dispatch = useAppDispatch();
  return useQuery({
    queryKey: [SUBSCRIPTION_KEY],
    queryFn: subscriptionApi.get,
    retry: false,
    onSuccess: (data) => {
      dispatch(updateUserSubscription(data));
    },
  });
};

export const useSubscriptionPlans = () => {
  return useQuery({
    queryKey: [PLANS_KEY],
    queryFn: subscriptionApi.getPlans,
    retry: false,
  });
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: subscriptionApi.create,
    onSuccess: (data) => {
      dispatch(updateUserSubscription(data));
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_KEY] });
    },
  });
};

export const useUpdateSubscription = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: subscriptionApi.update,
    onSuccess: (data) => {
      dispatch(updateUserSubscription(data));
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_KEY] });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();

  return useMutation({
    mutationFn: subscriptionApi.cancel,
    onSuccess: (data) => {
      dispatch(updateUserSubscription(data));
      queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_KEY] });
    },
  });
};
