import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { SubscriptionService } from '../subscription/subscription.service';
import { UsersService } from '../users/users.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    private configService: ConfigService,
    private subscriptionService: SubscriptionService,
    private usersService: UsersService,
  ) {
    const stripeSecretKey = this.configService.get<string>('STRIPE_SECRET_KEY');
    if (!stripeSecretKey) {
      this.logger.warn('⚠️ Stripe secret key not configured');
    } else {
      // Use Stripe SDK default API version to avoid TS literal mismatch
      this.stripe = new Stripe(stripeSecretKey, {});
      this.logger.log('✅ Stripe initialized successfully');
    }
  }

  async createCheckoutSession(userId: string, priceId: string, plan: string) {
    if (!this.stripe) {
      throw new BadRequestException('Payment system not configured');
    }

    const user = await this.usersService.findOne(userId);    
    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: user.email,
        name: user.fullName,
        metadata: {
          userId: user.id,
        },
      });
      customerId = customer.id;
      
      // Save Stripe customer ID to user
      await this.usersService.updateStripeCustomerId(userId, customerId);
    }

    // Create checkout session
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${this.configService.get('FRONTEND_URL')}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.configService.get('FRONTEND_URL')}/subscription/cancel`,
      metadata: {
        userId,
        plan,
      },
    });

    return { checkoutUrl: session.url };
  }
  async handleWebhook(signature: string, payload: Buffer) {
    if (!this.stripe) {
      throw new BadRequestException('Payment system not configured');
    }

    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }

    let event: Stripe.Event;
    
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      this.logger.error(`❌ Webhook signature verification failed: ${err.message}`);
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.log(`📨 Webhook received: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_failed':
        await this.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      default:
        this.logger.log(`🤷 Unhandled event type: ${event.type}`);
    }

    return { received: true };
  }
  private async handleCheckoutCompleted(session: Stripe.Checkout.Session) {
    if (!session.metadata) {
      this.logger.error('Missing metadata in checkout session');
      return;
    }
    
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;
    
    if (!userId || !plan) {
      this.logger.error('Missing metadata in checkout session');
      return;
    }

    // Validate plan type
    const validPlans = ['starter', 'pro', 'enterprise'] as const;
    if (!validPlans.includes(plan as any)) {
      this.logger.error(`Invalid plan type: ${plan}`);
      return;
    }

    // Create or update subscription
    await this.subscriptionService.create({
      plan: plan as 'starter' | 'pro' | 'enterprise',
      status: 'active',
      stripeSubscriptionId: session.subscription as string,
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    }, userId);

    this.logger.log(`✅ Subscription created for user ${userId}`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;
    
    if (!userId) {
      this.logger.error('❌ Missing userId in subscription metadata');
      return;
    }

    await this.subscriptionService.update(userId, {
      status: subscription.status as any,
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    });

    this.logger.log(`✅ Subscription updated for user ${userId}`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription) {
    const userId = subscription.metadata.userId;
    
    if (!userId) {
      this.logger.error('❌ Missing userId in subscription metadata');
      return;
    }

    await this.subscriptionService.cancel(userId);
    this.logger.log(`✅ Subscription cancelled for user ${userId}`);
  }

  private async handlePaymentFailed(invoice: Stripe.Invoice) {
    this.logger.warn(`⚠️ Payment failed for invoice ${invoice.id}`);
    // TODO: Send email notification to user
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.subscriptionService.findByUserId(userId);
    
    if (!subscription.stripeSubscriptionId) {
      throw new BadRequestException('No active subscription found');
    }

    if (!this.stripe) {
      throw new BadRequestException('Payment system not configured');
    }

    await this.stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    await this.subscriptionService.update(userId, {
      status: 'cancelled',
    });

    return { message: 'Subscription will be cancelled at the end of the billing period' };
  }
}
