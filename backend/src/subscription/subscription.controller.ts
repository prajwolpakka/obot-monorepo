import { Controller, Get, Post, Body, Patch, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubscriptionService, SubscriptionPlan } from './subscription.service';
import { CreateSubscriptionDto, UpdateSubscriptionDto } from './dto/subscription.dto';

@ApiTags('subscription')
@ApiBearerAuth()
@Controller('subscription')
@UseGuards(JwtAuthGuard)
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get('plans')
  @ApiOperation({ summary: 'Get available subscription plans' })
  @ApiResponse({ status: 200, description: 'Plans retrieved successfully' })
  getPlans(): SubscriptionPlan[] {
    return this.subscriptionService.getPlans();
  }

  @Post()
  @ApiOperation({ summary: 'Create or upgrade subscription' })
  @ApiResponse({ status: 201, description: 'Subscription created successfully' })
  create(@Body() createSubscriptionDto: CreateSubscriptionDto, @Request() req) {
    return this.subscriptionService.create(createSubscriptionDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get user subscription details' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Subscription not found' })
  findOne(@Request() req) {
    return this.subscriptionService.findOrCreateByUserId(req.user.id);
  }

  @Patch()
  @ApiOperation({ summary: 'Update subscription' })
  @ApiResponse({ status: 200, description: 'Subscription updated successfully' })
  update(@Body() updateSubscriptionDto: UpdateSubscriptionDto, @Request() req) {
    return this.subscriptionService.update(req.user.id, updateSubscriptionDto);
  }

  @Patch('cancel')
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled successfully' })
  cancel(@Request() req) {
    return this.subscriptionService.cancel(req.user.id);
  }
}
