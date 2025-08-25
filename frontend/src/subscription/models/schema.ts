
import { z } from "zod";

export const subscribeSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
  paymentMethodId: z.string().min(1, "Payment method is required"),
});

export const updateSubscriptionSchema = z.object({
  planId: z.string().min(1, "Plan ID is required"),
});

export type ISubscribeSchema = z.infer<typeof subscribeSchema>;
export type IUpdateSubscriptionSchema = z.infer<typeof updateSubscriptionSchema>;
