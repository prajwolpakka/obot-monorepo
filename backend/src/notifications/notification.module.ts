import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Notification } from './notification.entity';
import { NotificationGateway } from './notification.gateway';
import { NotificationHelper } from './notification.helper';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    forwardRef(() => AuthModule),
  ],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway, NotificationHelper],
  exports: [NotificationService, NotificationGateway, NotificationHelper],
})
export class NotificationModule {}
