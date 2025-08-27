
export interface ISubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  priceId?: string;
  currency: 'USD' | 'EUR' | 'GBP';
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
  maxChatbots?: number;
  maxDocuments?: number;
  maxConversations?: number;
  maxMessages?: number;
}

export interface ISubscription {
  id: string;
  plan: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
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
