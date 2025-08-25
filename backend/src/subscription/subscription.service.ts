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

  async create(createSubscriptionDto: CreateSubscriptionDto, userId: string): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create({
      ...createSubscriptionDto,
      status: 'active',
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
