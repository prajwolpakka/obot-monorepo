import { IsEnum, IsOptional, IsString, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateSubscriptionDto {
  @ApiProperty({ description: 'Subscription plan type', enum: ['free', 'basic', 'premium'], example: 'basic' })
  @IsEnum(['free', 'basic', 'premium'])
  plan: 'free' | 'basic' | 'premium';

  @ApiProperty({ description: 'Subscription status', enum: ['active', 'inactive', 'cancelled', 'expired'], example: 'active' })
  @IsEnum(['active', 'inactive', 'cancelled', 'expired'])
  status: 'active' | 'inactive' | 'cancelled' | 'expired';

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
  @ApiProperty({ description: 'Updated subscription plan type', enum: ['free', 'basic', 'premium'], example: 'premium', required: false })
  @IsOptional()
  @IsEnum(['free', 'basic', 'premium'])
  plan?: 'free' | 'basic' | 'premium';

  @ApiProperty({ description: 'Subscription status', enum: ['active', 'inactive', 'cancelled', 'cancelling', 'expired'], example: 'active', required: false })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'cancelled', 'cancelling', 'expired'])
  status?: 'active' | 'inactive' | 'cancelled' | 'cancelling' | 'expired';

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
