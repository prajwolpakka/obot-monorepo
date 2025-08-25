import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UsersService } from "../../users/users.service";

// Custom extractor function to get token from cookie
const cookieExtractor = (req: Request): string | null => {
  let token: string | null = null;
  if (req && req.cookies) {
    // Extract the token specifically from the 'auth_token' cookie
    token = req.cookies["auth_token"];
  }
  // Ensure we explicitly return null if the cookie wasn't found or empty
  return token || null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    @Inject(ConfigService)
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    const secret = configService.get("JWT_SECRET") || "dummy-secret-key";

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: secret,
    });

    if (!configService.get("JWT_SECRET")) {
      this.logger.warn("JWT_SECRET not configured, using default secret (not secure for production)");
    }
  }

  async validate(payload: any) {
    const userId = payload.sub;
    const user = await this.usersService.findOne(userId);
    // Return complete user object plus the additional properties from the JWT
    const { email } = user;
    return {
      id: userId,
      email,
    };
  }
}
