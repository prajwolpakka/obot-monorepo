import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationDto, UpdateNotificationDto, NotificationQueryDto } from './notification.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationService.create(createNotificationDto);
  }

  @Get()
  findAll(@GetUser() user: User, @Query() query: NotificationQueryDto) {
    return this.notificationService.findAllByUser(user.id, query);
  }

  @Get('unread-count')
  getUnreadCount(@GetUser() user: User) {
    return this.notificationService.getUnreadCount(user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationService.update(id, updateNotificationDto);
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationService.markAsRead(id);
  }

  @Patch('mark-all-read')
  markAllAsRead(@GetUser() user: User) {
    return this.notificationService.markAllAsRead(user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.delete(id);
  }

  @Delete()
  removeAll(@GetUser() user: User) {
    return this.notificationService.deleteAllByUser(user.id);
  }
}
