import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { WsJwtGuard } from '../../auth/guards/ws-jwt.guard';

@WebSocketGateway({
  namespace: 'embedding-status',
  cors: {
    origin: true, // reflect request origin
    credentials: true,
  },
})
export class EmbeddingStatusGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(EmbeddingStatusGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }
  @UseGuards(WsJwtGuard)
  @SubscribeMessage('subscribe-document')
  async subscribeToDocument(
    @MessageBody() documentId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`document-${documentId}`);
    this.logger.log(`Client ${client.id} subscribed to document ${documentId}`);
    return { event: 'subscribed', data: { documentId } };
  }

  @UseGuards(WsJwtGuard)
  @SubscribeMessage('unsubscribe-document')
  async unsubscribeFromDocument(
    @MessageBody() documentId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`document-${documentId}`);
    this.logger.log(`Client ${client.id} unsubscribed from document ${documentId}`);
    return { event: 'unsubscribed', data: { documentId } };
  }

  // Method to emit status updates
  emitStatusUpdate(documentId: string, status: string) {
    this.server.to(`document-${documentId}`).emit('status-update', {
      documentId,
      status,
      timestamp: new Date(),
    });
    this.logger.log(`Emitted status update for document ${documentId}: ${status}`);
  }
}
