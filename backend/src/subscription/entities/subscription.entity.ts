import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ enum: ['free', 'basic', 'premium'] })
  plan: 'free' | 'basic' | 'premium';

  @Column({ enum: ['active', 'inactive', 'cancelled', 'expired'] })
  status: 'active' | 'inactive' | 'cancelled' | 'expired';

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  monthlyPrice: number;

  @Column({ nullable: true })
  startDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true })
  currentPeriodEnd: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => User, user => user.subscription, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  userId: string;
}
