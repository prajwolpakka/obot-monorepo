import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { WebSocketAuthService } from '../auth/websocket-auth.service';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(NotificationGateway.name);
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private notificationService: NotificationService,
    private webSocketAuthService: WebSocketAuthService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const user = await this.webSocketAuthService.authenticateSocket(client);
      (client as any).user = user;
      this.logger.log(`Client connected: ${client.id} for user ${user.id}`);
    } catch (error) {
      this.logger.error(`Authentication failed for client ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Remove client from all user rooms
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(client.id)) {
        sockets.delete(client.id);
        if (sockets.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  @SubscribeMessage('join-user-room')
  handleJoinUserRoom(client: Socket, userId: string) {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);
    client.join(`user:${userId}`);
    console.log(`Client ${client.id} joined room for user ${userId}`);
  }

  @SubscribeMessage('leave-user-room')
  handleLeaveUserRoom(client: Socket, userId: string) {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
    client.leave(`user:${userId}`);
    console.log(`Client ${client.id} left room for user ${userId}`);
  }

  // Method to send notifications to specific users
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('new-notification', notification);
  }

  // Method to send notification updates
  sendNotificationUpdate(userId: string, notificationId: string, update: any) {
    this.server.to(`user:${userId}`).emit('notification-updated', {
      id: notificationId,
      ...update,
    });
  }

  // Method to send unread count updates
  sendUnreadCountUpdate(userId: string, count: number) {
    this.server.to(`user:${userId}`).emit('unread-count-updated', { count });
  }
}
