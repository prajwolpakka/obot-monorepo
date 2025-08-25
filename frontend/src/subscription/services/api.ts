import api from "@/common/services/api";
import { ISubscribeSchema, IUpdateSubscriptionSchema } from "../models/schema";
import { ISubscription } from "../models/types";

export const subscriptionApi = {
  get: async () => {
    const response = await api.get<ISubscription>("/subscription");
    return response.data;
  },

  create: async (data: ISubscribeSchema) => {
    const response = await api.post<ISubscription>("/subscription", data);
    return response.data;
  },

  update: async (data: IUpdateSubscriptionSchema) => {
    const response = await api.patch<ISubscription>("/subscription", data);
    return response.data;
  },

  cancel: async () => {
    const response = await api.post("/payment/cancel");
    return response.data;
  },

  createCheckoutSession: async (priceId: string, plan: string) => {
    const response = await api.post("/payment/create-checkout-session", {
      priceId,
      plan,
    });
    return response.data;
  },

  getPlans: async () => {
    const response = await api.get("/subscription/plans");
    return response.data;
  },
};
