
import { z } from "zod";

export const subscribeSchema = z.object({
  plan: z.string().min(1, "Plan is required"),
  paymentMethodId: z.string().min(1, "Payment method is required"),
});

export const updateSubscriptionSchema = z.object({
  plan: z.string().min(1, "Plan is required"),
});

export type ISubscribeSchema = z.infer<typeof subscribeSchema>;
export type IUpdateSubscriptionSchema = z.infer<typeof updateSubscriptionSchema>;
