import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const client: Socket = context.switchToWs().getClient<Socket>();
      const token = this.extractTokenFromClient(client);
      
      if (!token) {
        throw new WsException('Unauthorized');
      }

      const payload = await this.jwtService.verifyAsync(token);
      client.data.user = payload;
      
      return true;
    } catch {
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromClient(client: Socket): string | undefined {
    const token = client.handshake.auth.token || client.handshake.headers.authorization;
    
    if (token && token.startsWith('Bearer ')) {
      return token.substring(7);
    }
    
    return token;
  }
}