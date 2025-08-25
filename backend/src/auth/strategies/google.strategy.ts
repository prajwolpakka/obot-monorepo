import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, type VerifyCallback } from "passport-google-oauth20";
import { AuthService } from "../auth.service";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  private readonly logger = new Logger(GoogleStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {
    const clientID = configService.get<string>("GOOGLE_CLIENT_ID");
    const clientSecret = configService.get<string>("GOOGLE_CLIENT_SECRET");
    const callbackURL = configService.get<string>("GOOGLE_CALLBACK_URL");

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ["email", "profile"],
      proxy: true,
    });

    if (!clientID) {
      this.logger.warn("GOOGLE_CLIENT_ID not configured, Google authentication will not work", "constructor");
    }
  }

  // accessToken, refreshToken, profile, done
  async validate(_: string, __: string, profile: any, done: VerifyCallback): Promise<any> {
    const validatedUser = await this.authService.validateGoogleUser({
      email: profile.emails[0].value,
      fullName: profile.name.givenName + " " + profile.name.familyName,
      password: Math.random().toString(36).slice(-8),
      isEmailVerified: true,
    });
    // Error object, and user object
    done(null, validatedUser);
  }
}
