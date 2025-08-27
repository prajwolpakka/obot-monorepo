import PageTitle from "@/common/components/page-title";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/common/components/ui/alert-dialog";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/common/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { AlertTriangle, BarChart, Check, CreditCard, Crown, Zap } from "lucide-react";
import { useState } from "react";
import { subscriptionApi } from "../services/api";
import { useSubscription, useSubscriptionPlans, useUpdateSubscription } from "../services/hooks";

const SubscriptionPage = () => {
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);

  const { data: subscription, isLoading: subscriptionLoading } = useSubscription();
  const { data: plans = [], isLoading: plansLoading } = useSubscriptionPlans();
  const updateSubscription = useUpdateSubscription();

  const currentPlan = plans.find((p) => p.id === subscription?.plan);

  const handleChangePlan = async (planId: string) => {
    const selectedPlan = plans.find((p) => p.id === planId);
    if (!selectedPlan) return;
    if (selectedPlan.price === 0) {
      updateSubscription.mutate({ plan: planId });
    } else if (selectedPlan.priceId) {
      const session = await subscriptionApi.createCheckoutSession(selectedPlan.priceId, planId);
      window.location.href = session.checkoutUrl;
    }
    setIsChangePlanOpen(false);
  };

  if (subscriptionLoading || plansLoading || !currentPlan) {
    return <div>Loading...</div>;
  }

  const handleCancelSubscription = () => {
    console.log("Cancelling subscription");
  };

  return (
    <div className="p-4 h-full w-full overflow-hidden">
      <Card className="h-full flex flex-col">
        <CardContent className="p-6 flex flex-col h-full min-h-0">
          <div className="space-y-6 flex-1 flex flex-col min-h-0">
            {/* Header */}
            <PageTitle title="Subscription" description="Manage your subscription and billing" />

            <Tabs defaultValue="overview" className="space-y-6 flex-1 flex flex-col min-h-0">
              <TabsList className="justify-start w-min">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing
                </TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6 flex-1 overflow-y-auto">
                {/* Current Plan */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Crown className="h-5 w-5 text-yellow-500" />
                          Current Plan: {currentPlan.name}
                        </CardTitle>
                        <CardDescription>
                          ${currentPlan.price}/{currentPlan.interval}
                          {currentPlan.price > 0 && subscription?.currentPeriodEnd
                            ? ` • Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                            : ''}
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">{subscription?.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Current Plan Features */}
                    <div>
                      <h4 className="font-medium mb-3">Plan Features</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {currentPlan.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Check className="h-4 w-4 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Dialog open={isChangePlanOpen} onOpenChange={setIsChangePlanOpen}>
                        <DialogTrigger asChild>
                          <Button variant="outline">Change Plan</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Choose Your Plan</DialogTitle>
                            <DialogDescription>Select the plan that best fits your needs</DialogDescription>
                          </DialogHeader>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            {plans.map((plan) => {
                              const isCurrent = plan.id === currentPlan.id;
                              const isPopular = plan.isPopular || plan.id === "pro";
                              return (
                                <Card
                                  key={plan.id}
                                  className={`relative flex flex-col ${
                                    isPopular ? "border-blue-500 ring-1 ring-blue-500" : ""
                                  } ${isCurrent ? "bg-gray-50 dark:bg-gray-900" : ""}`}
                                >
                                  {isPopular && (
                                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                                      <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                                    </div>
                                  )}
                                  <CardHeader className="text-center">
                                    <CardTitle className="flex items-center justify-center gap-2">
                                      <Zap className="h-5 w-5" />
                                      {plan.name}
                                    </CardTitle>
                                    <div className="space-y-2">
                                      <div className="text-3xl font-bold">${plan.price}</div>
                                      <div className="text-sm text-gray-500">
                                        {plan.price === 0
                                          ? "Forever"
                                          : plan.interval === "year"
                                          ? "per year"
                                          : "per month"}
                                      </div>
                                    </div>
                                    {plan.description && <CardDescription>{plan.description}</CardDescription>}
                                  </CardHeader>
                                  <CardContent className="flex flex-col flex-1">
                                    <div className="space-y-2 flex-1">
                                      {plan.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2 text-sm">
                                          <Check className="h-4 w-4 text-green-500" />
                                          <span>{feature}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <Button
                                      className="w-full mt-6"
                                      variant={isCurrent ? "secondary" : "default"}
                                      disabled={isCurrent}
                                      onClick={() => handleChangePlan(plan.id)}
                                    >
                                      {isCurrent ? "Current Plan" : "Select Plan"}
                                    </Button>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {currentPlan.price > 0 && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline">Cancel Subscription</Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                                Cancel Subscription
                              </AlertDialogTitle>
                              <AlertDialogDescription className="space-y-3">
                                <p>Are you sure you want to cancel your subscription?</p>
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg space-y-2">
                                  <p className="font-medium">What happens when you cancel:</p>
                                  <ul className="text-sm space-y-1 list-disc list-inside">
                                    <li>Your plan will remain active until February 15, 2024</li>
                                    <li>You'll lose access to Pro features after this date</li>
                                    <li>Your chatbots will be limited to Basic plan features</li>
                                    <li>You can resubscribe at any time</li>
                                  </ul>
                                </div>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={handleCancelSubscription}
                              >
                                Yes, Cancel
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing" className="space-y-6 flex-1 overflow-y-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>Your recent billing transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {currentPlan.price === 0 ? (
                      <p>No billing history for free plan.</p>
                    ) : (
                      <div className="space-y-4">
                        {[
                          { date: "Jan 15, 2024", amount: "$29.00", status: "Paid", description: "Pro Plan - Monthly" },
                          { date: "Dec 15, 2023", amount: "$29.00", status: "Paid", description: "Pro Plan - Monthly" },
                          { date: "Nov 15, 2023", amount: "$29.00", status: "Paid", description: "Pro Plan - Monthly" },
                        ].map((transaction, index) => (
                          <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                            <div>
                              <div className="font-medium">{transaction.description}</div>
                              <div className="text-sm text-gray-500">{transaction.date}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-medium">{transaction.amount}</span>
                              <Badge variant="secondary">{transaction.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionPage;
