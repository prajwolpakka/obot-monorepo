import { IsEnum, IsOptional, IsString, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Subscription plan type', enum: ['starter', 'pro', 'enterprise'], example: 'starter' })
  @IsEnum(['starter', 'pro', 'enterprise'])
  plan: 'starter' | 'pro' | 'enterprise';

  @ApiProperty({ description: 'Subscription status', enum: ['active', 'inactive', 'cancelled', 'expired'], example: 'active', required: false })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'cancelled', 'expired'])
  status?: 'active' | 'inactive' | 'cancelled' | 'expired';

  @ApiProperty({ description: 'Stripe subscription ID', required: false })
  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string;

  @ApiProperty({ description: 'Current billing period end date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  currentPeriodEnd?: Date;
}

export class UpdateSubscriptionDto {
  @ApiProperty({ description: 'Updated subscription plan type', enum: ['starter', 'pro', 'enterprise'], example: 'pro', required: false })
  @IsOptional()
  @IsEnum(['starter', 'pro', 'enterprise'])
  plan?: 'starter' | 'pro' | 'enterprise';

  @ApiProperty({ description: 'Subscription status', enum: ['active', 'inactive', 'cancelled', 'expired'], example: 'active', required: false })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'cancelled', 'expired'])
  status?: 'active' | 'inactive' | 'cancelled' | 'expired';

  @ApiProperty({ description: 'Stripe subscription ID', required: false })
  @IsOptional()
  @IsString()
  stripeSubscriptionId?: string;

  @ApiProperty({ description: 'Current billing period end date', required: false })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  currentPeriodEnd?: Date;
}
