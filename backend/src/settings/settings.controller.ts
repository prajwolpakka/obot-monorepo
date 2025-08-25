import { Controller, Get, Put, Body, UseGuards, Request, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';
import { UpdateProfileDto, UpdatePreferencesDto, UpdateSecurityDto } from './dto/settings.dto';

@ApiTags('settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile settings' })
  async getProfile(@Request() req) {
    return this.settingsService.getProfile(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  async updateProfile(@Request() req, @Body() dto: UpdateProfileDto) {
    return this.settingsService.updateProfile(req.user.id, dto);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user preferences' })
  async getPreferences(@Request() req) {
    return this.settingsService.getPreferences(req.user.id);
  }
  @Put('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  async updatePreferences(@Request() req, @Body() dto: UpdatePreferencesDto) {
    return this.settingsService.updatePreferences(req.user.id, dto);
  }

  @Get('security')
  @ApiOperation({ summary: 'Get security settings' })
  async getSecuritySettings(@Request() req) {
    return this.settingsService.getSecuritySettings(req.user.id);
  }

  @Put('security')
  @ApiOperation({ summary: 'Update security settings' })
  async updateSecuritySettings(@Request() req, @Body() dto: UpdateSecurityDto) {
    return this.settingsService.updateSecuritySettings(req.user.id, dto);
  }

  @Get('integrations')
  @ApiOperation({ summary: 'Get integrations' })
  async getIntegrations(@Request() req) {
    return this.settingsService.getIntegrations(req.user.id);
  }

  @Put('integrations/:type')
  @ApiOperation({ summary: 'Update integration settings' })
  async updateIntegration(
    @Request() req,
    @Param('type') type: string,
    @Body() config: any
  ) {
    return this.settingsService.updateIntegration(req.user.id, type, config);
  }
}