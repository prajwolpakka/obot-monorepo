
export interface ISubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: 'USD' | 'EUR' | 'GBP';
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
  maxChatbots: number;
  maxDocuments: number;
  maxConversations: number;
}

export interface ISubscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired' | 'trial';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IUsage {
  chatbots: {
    used: number;
    limit: number;
  };
  documents: {
    used: number;
    limit: number;
  };
  conversations: {
    used: number;
    limit: number;
  };
}

export interface ISubscriptionData {
  currentSubscription?: ISubscription;
  availablePlans: ISubscriptionPlan[];
  usage: IUsage;
}
