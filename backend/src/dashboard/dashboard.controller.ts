import { Controller, Get, Query, Request, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { DashboardService } from "./dashboard.service";

@ApiTags("dashboard")
@Controller("dashboard")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get("metrics")
  @ApiOperation({ summary: "Get dashboard metrics" })
  @ApiResponse({ status: 200, description: "Dashboard metrics retrieved successfully" })
  async getMetrics(@Request() req) {
    return this.dashboardService.getMetrics(req.user.userId);
  }

  @Get("messages-over-time")
  @ApiOperation({ summary: "Get messages over time data (365 days)" })
  @ApiResponse({ status: 200, description: "Messages over time data retrieved successfully" })
  async getMessagesOverTime(@Request() req) {
    return this.dashboardService.getMessagesOverTime(req.user.userId);
  }

  @Get("chatbot-performance")
  @ApiOperation({ summary: "Get chatbot performance data" })
  @ApiResponse({ status: 200, description: "Chatbot performance data retrieved successfully" })
  async getChatbotPerformance(@Request() req, @Query("timeRange") timeRange: string = "7days") {
    return this.dashboardService.getChatbotPerformance(req.user.userId, timeRange);
  }
}
