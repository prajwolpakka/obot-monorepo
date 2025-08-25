import { Controller, Post, Body, UseGuards, Request, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaymentService } from './payment.service';

@ApiTags('payment')
@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('create-checkout-session')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a Stripe checkout session' })
  @ApiResponse({ status: 200, description: 'Checkout session created' })
  async createCheckoutSession(
    @Request() req,
    @Body() body: { priceId: string; plan: string }
  ) {
    return this.paymentService.createCheckoutSession(
      req.user.id,
      body.priceId,
      body.plan
    );
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  async handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Request() req
  ) {
    return this.paymentService.handleWebhook(signature, Buffer.from(req.rawBody || req.body));
  }
  @Post('cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled' })
  async cancelSubscription(@Request() req) {
    return this.paymentService.cancelSubscription(req.user.id);
  }
}