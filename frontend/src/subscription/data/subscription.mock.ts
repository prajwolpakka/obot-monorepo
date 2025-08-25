
import { ISubscriptionPlan, ISubscription, IUsage } from '../models/types';

export const mockSubscriptionPlans: ISubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small businesses getting started',
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: [
      'Up to 2 chatbots',
      '100 documents',
      '1,000 conversations/month',
      'Email support',
      'Basic analytics',
    ],
    maxChatbots: 2,
    maxDocuments: 100,
    maxConversations: 1000,
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Best for growing businesses',
    price: 79,
    currency: 'USD',
    interval: 'month',
    features: [
      'Up to 10 chatbots',
      '1,000 documents',
      '10,000 conversations/month',
      'Priority support',
      'Advanced analytics',
      'Custom branding',
    ],
    isPopular: true,
    maxChatbots: 10,
    maxDocuments: 1000,
    maxConversations: 10000,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For large organizations with complex needs',
    price: 199,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited chatbots',
      'Unlimited documents',
      'Unlimited conversations',
      '24/7 phone support',
      'White-label solution',
      'API access',
      'SSO integration',
    ],
    maxChatbots: -1, // unlimited
    maxDocuments: -1, // unlimited
    maxConversations: -1, // unlimited
  },
];

export const mockCurrentSubscription: ISubscription = {
  id: 'sub_123',
  planId: 'pro',
  status: 'active',
  currentPeriodStart: '2024-01-01T00:00:00Z',
  currentPeriodEnd: '2024-02-01T00:00:00Z',
  cancelAtPeriodEnd: false,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

export const mockUsage: IUsage = {
  chatbots: {
    used: 3,
    limit: 10,
  },
  documents: {
    used: 156,
    limit: 1000,
  },
  conversations: {
    used: 2847,
    limit: 10000,
  },
};
