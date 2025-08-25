import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserPreferences } from './entities/user-preferences.entity';
import { UserIntegration } from './entities/user-integration.entity';
import { UpdateProfileDto, UpdatePreferencesDto, UpdateSecurityDto } from './dto/settings.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserPreferences)
    private preferencesRepository: Repository<UserPreferences>,
    @InjectRepository(UserIntegration)
    private integrationRepository: Repository<UserIntegration>,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    await this.userRepository.update(userId, {
      fullName: dto.fullName,
    });
    return this.getProfile(userId);
  }
  async getPreferences(userId: string) {
    let preferences = await this.preferencesRepository.findOne({ where: { userId } });
    
    if (!preferences) {
      preferences = await this.preferencesRepository.save({
        userId,
        language: 'en',
        theme: 'light',
        emailNotifications: true,
        pushNotifications: false,
        timezone: 'UTC',
      });
    }
    
    return preferences;
  }

  async updatePreferences(userId: string, dto: UpdatePreferencesDto) {
    let preferences = await this.preferencesRepository.findOne({ where: { userId } });
    
    if (!preferences) {
      preferences = this.preferencesRepository.create({ userId });
    }
    
    Object.assign(preferences, dto);
    return await this.preferencesRepository.save(preferences);
  }

  async getSecuritySettings(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      lastPasswordChange: user.updatedAt,
    };
  }

  async updateSecuritySettings(userId: string, dto: UpdateSecurityDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // Verify current password
    const isValidPassword = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid current password');
    }
    
    // Update password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.update(userId, { password: hashedPassword });
    
    return { message: 'Password updated successfully' };
  }
  async getIntegrations(userId: string) {
    const integrations = await this.integrationRepository.find({ where: { userId } });
    
    const integrationMap = {
      slack: { enabled: false, webhookUrl: null },
      teams: { enabled: false, webhookUrl: null },
      zapier: { enabled: false, apiKey: null },
    };
    
    integrations.forEach(int => {
      integrationMap[int.type] = {
        enabled: int.enabled,
        ...int.config,
      };
    });
    
    return integrationMap;
  }

  async updateIntegration(userId: string, type: string, config: any) {
    let integration = await this.integrationRepository.findOne({
      where: { userId, type }
    });
    
    if (!integration) {
      integration = this.integrationRepository.create({
        userId,
        type,
      });
    }
    
    integration.enabled = config.enabled;
    integration.config = config;
    
    await this.integrationRepository.save(integration);
    return integration;
  }
}