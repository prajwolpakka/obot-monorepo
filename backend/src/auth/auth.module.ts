import { Module, forwardRef } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { MailModule } from "../mail/mail.module";
import { TokensModule } from "../tokens/tokens.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { WebSocketAuthService } from "./websocket-auth.service";
import { CookieAuthGuard } from "./guards/cookie-auth.guard";
import { GoogleStrategy } from "./strategies/google.strategy";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    forwardRef(() => MailModule),
    forwardRef(() => TokensModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET"),
        signOptions: { expiresIn: configService.get("JWT_EXPIRES_IN", "1d") },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, WebSocketAuthService, LocalStrategy, JwtStrategy, GoogleStrategy, CookieAuthGuard],
  exports: [AuthService, WebSocketAuthService],
})
export class AuthModule {}
