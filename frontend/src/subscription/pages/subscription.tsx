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
import { Progress } from "@/common/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/common/components/ui/tabs";
import { AlertTriangle, BarChart, Check, CreditCard, Crown, MessageSquare, Users, Zap } from "lucide-react";
import { useState } from "react";

const SubscriptionPage = () => {
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const currentPlan = {
    name: "Pro",
    price: 29,
    billing: "monthly",
    features: ["5 chatbots", "10,000 messages/month", "Priority support", "Advanced analytics", "Custom branding"],
    usage: {
      chatbots: { used: 3, limit: 5 },
      messages: { used: 4560, limit: 10000 },
      support: "Priority",
    },
  };

  const plans = [
    {
      name: "Free",
      price: 0,
      description: "Perfect for getting started",
      features: ["1 chatbot", "150 messages/month", "Community support", "Basic analytics"],
      popular: false,
    },
    {
      name: "Pro",
      price: 29,
      description: "Great for growing businesses",
      features: ["5 chatbots", "10,000 messages/month", "Priority support", "Advanced analytics", "Custom branding"],
      popular: true,
    },
    {
      name: "Enterprise",
      price: 99,
      description: "For large organizations",
      features: [
        "50 chatbots",
        "100,000 messages/month",
        "24/7 phone support",
        "Advanced analytics",
        "Custom branding",
      ],
      popular: false,
    },
  ];

  const handleChangePlan = (planName: string) => {
    setSelectedPlan(planName);
    console.log(`Changing to ${planName} plan`);
    setIsChangePlanOpen(false);
  };

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
                          ${currentPlan.price}/{currentPlan.billing} • Renews on February 15, 2024
                        </CardDescription>
                      </div>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Usage Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Chatbots
                          </span>
                          <span>
                            {currentPlan.usage.chatbots.used} of {currentPlan.usage.chatbots.limit}
                          </span>
                        </div>
                        <Progress
                          value={(currentPlan.usage.chatbots.used / (currentPlan.usage.chatbots.limit as number)) * 100}
                          className="h-2"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Messages
                          </span>
                          <span>
                            {currentPlan.usage.messages.used.toLocaleString()} of{" "}
                            {currentPlan.usage.messages.limit.toLocaleString()}
                          </span>
                        </div>
                        <Progress
                          value={(currentPlan.usage.messages.used / currentPlan.usage.messages.limit) * 100}
                          className="h-2"
                        />
                      </div>
                    </div>

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
                            {plans.map((plan) => (
                              <Card
                                key={plan.name}
                                className={`relative flex flex-col ${
                                  plan.popular ? "border-blue-500 ring-1 ring-blue-500" : ""
                                } ${plan.name === currentPlan.name ? "bg-gray-50 dark:bg-gray-900" : ""}`}
                              >
                                {plan.popular && (
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
                                      {plan.price === 0 ? "Forever" : "per month"}
                                    </div>
                                  </div>
                                  <CardDescription>{plan.description}</CardDescription>
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
                                    variant={plan.name === currentPlan.name ? "secondary" : "default"}
                                    disabled={plan.name === currentPlan.name}
                                    onClick={() => handleChangePlan(plan.name)}
                                  >
                                    {plan.name === currentPlan.name ? "Current Plan" : "Select Plan"}
                                  </Button>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>

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
