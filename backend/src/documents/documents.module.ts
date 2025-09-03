import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { NotificationModule } from '../notifications/notification.module';
import { EmbeddingStatusGateway } from './gateways/embedding-status.gateway';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Document]),
    NotificationModule,
    AiModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN', '1d') },
      }),
    }),
    MulterModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: './uploads/documents',
          filename: (req, file, cb) => {
            const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
            return cb(null, `${randomName}${extname(file.originalname)}`);
          },
        }),
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [DocumentsController],
  providers: [DocumentsService, EmbeddingStatusGateway],
  exports: [DocumentsService, EmbeddingStatusGateway],
})
export class DocumentsModule {}
