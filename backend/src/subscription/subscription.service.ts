import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';
import { Subscription } from './entities/subscription.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  private readonly plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      currency: 'USD',
      interval: 'month',
      features: [
        '1 chatbot',
        '150 messages/month',
        'Community support',
        'Basic analytics',
      ],
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 29,
      currency: 'USD',
      interval: 'month',
      features: [
        '5 chatbots',
        '10,000 messages/month',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
      ],
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 99,
      currency: 'USD',
      interval: 'month',
      features: [
        '50 chatbots',
        '100,000 messages/month',
        '24/7 phone support',
        'Advanced analytics',
        'Custom branding',
      ],
    },
  ];

  getPlans() {
    return this.plans;
  }

  async create(createSubscriptionDto: CreateSubscriptionDto, userId: string): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create({
      ...createSubscriptionDto,
      status: createSubscriptionDto.status ?? 'active',
      userId,
    });
    
    return await this.subscriptionRepository.save(subscription);
  }

  async findByUserId(userId: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { userId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return subscription;
  }

  async findOrCreateByUserId(userId: string): Promise<Subscription> {
    let subscription = await this.subscriptionRepository.findOne({
      where: { userId },
    });

    if (!subscription) {
      subscription = this.subscriptionRepository.create({
        userId,
        plan: 'starter',
        status: 'active',
        monthlyPrice: 0,
        startDate: new Date(),
      });
      subscription = await this.subscriptionRepository.save(subscription);
    }

    return subscription;
  }

  async update(userId: string, updateSubscriptionDto: UpdateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    Object.assign(subscription, updateSubscriptionDto);
    return await this.subscriptionRepository.save(subscription);
  }

  async cancel(userId: string): Promise<Subscription> {
    const subscription = await this.findByUserId(userId);
    subscription.status = 'cancelled';
    return await this.subscriptionRepository.save(subscription);
  }
}
