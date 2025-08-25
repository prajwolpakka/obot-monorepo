import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { Socket } from 'socket.io';

@Injectable()
export class WebSocketAuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async authenticateSocket(client: Socket): Promise<any> {
    try {
      // Extract cookies from the socket handshake
      const cookies = this.parseCookies(client.handshake.headers.cookie || '');
      const token = cookies['auth_token'];

      if (!token) {
        throw new Error('No auth token found in cookies');
      }

      // Verify the JWT token
      const secret = this.configService.get('JWT_SECRET') || 'dummy-secret-key';
      const payload = this.jwtService.verify(token, { secret });

      // Get user data
      const user = await this.usersService.findOne(payload.sub);
      
      return {
        id: payload.sub,
        email: user.email,
        fullName: user.fullName,
      };
    } catch (error) {
      throw new Error(`WebSocket authentication failed: ${error.message}`);
    }
  }

  private parseCookies(cookieString: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    
    if (!cookieString) return cookies;

    cookieString.split(';').forEach(cookie => {
      const parts = cookie.trim().split('=');
      if (parts.length === 2) {
        cookies[parts[0]] = decodeURIComponent(parts[1]);
      }
    });

    return cookies;
  }
}
