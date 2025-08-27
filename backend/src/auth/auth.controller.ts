import { Body, Controller, Get, Logger, NotFoundException, Post, Request, Response, UseGuards } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response as ExpressResponse } from "express";
import { UsersService } from "../users/users.service";
import { SubscriptionService } from "../subscription/subscription.service";
import { AuthService } from "./auth.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { ResendVerificationEmailDto } from "./dto/resend-verification-email.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SignupDto } from "./dto/signup.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { GoogleAuthGuard } from "./guards/google-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { LocalAuthGuard } from "./guards/local-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly subscriptionService: SubscriptionService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  @ApiOperation({ summary: "Login with email and password" })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 401, description: "Invalid credentials or email not verified" })
  async login(@Request() req, @Response() res: ExpressResponse, @Body() loginDto: LoginDto): Promise<void> {
    const response = await this.authService.login(req.user, res);
    res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Post("logout")
  @ApiOperation({ summary: "Logout user" })
  @ApiResponse({ status: 200, description: "Logout successful" })
  @ApiBearerAuth()
  async logout(@Response() res: ExpressResponse): Promise<void> {
    const response = await this.authService.logout(res);
    res.json(response);
  }

  @Post("signup")
  @ApiOperation({ summary: "Register a new user" })
  @ApiResponse({ status: 201, description: "User registered successfully, verification email sent" })
  @ApiResponse({ status: 409, description: "Email already registered" })
  @ApiResponse({ status: 500, description: "Failed to send verification email" })
  async signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post("verify-email")
  @ApiOperation({ summary: "Verify email address" })
  @ApiResponse({ status: 200, description: "Email verified successfully" })
  @ApiResponse({ status: 400, description: "Invalid or expired verification token" })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post("resend-verification-email")
  @ApiOperation({ summary: "Resend verification email" })
  @ApiResponse({ status: 200, description: "Verification email sent successfully" })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 400, description: "Email already verified" })
  async resendVerificationEmail(@Body() resendVerificationEmailDto: ResendVerificationEmailDto) {
    return this.authService.resendVerificationEmail(resendVerificationEmailDto.email);
  }

  @Post("resend-verification-by-token")
  @ApiOperation({ summary: "Resend verification email using existing token" })
  async resendVerificationByToken(@Body() { token }: { token: string }) {
    return this.authService.resendVerificationEmailByToken(token);
  }

  @Post("forgot-password")
  @ApiOperation({ summary: "Request password reset" })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Reset password with token" })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("change-password")
  @ApiOperation({ summary: "Change password (authenticated)" })
  @ApiBearerAuth()
  async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get user profile" })
  @ApiBearerAuth()
  async getProfile(@Request() req) {
    this.logger.log(`Fetching profile for user ID: ${req.user.id}`, "getProfile");
    const userId = req.user.id;
    const completeUser = await this.usersService.findOne(userId);

    if (!completeUser) {
      this.logger.error(`User not found during profile fetch: ${userId}`, "getProfile");
      throw new NotFoundException("User not found");
    }

    const subscription = await this.subscriptionService.findOrCreateByUserId(userId);
    const { password, ...userWithoutPassword } = completeUser;

    this.logger.log(`Profile fetched successfully for user ${userId}`, "getProfile");
    return {
      user: { ...userWithoutPassword, subscription },
    };
  }

  @Get("google/login")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Initiate Google OAuth login" })
  async googleLogin() {
    // This route initiates the Google OAuth flow
    // The actual implementation is handled by Passport
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({ summary: "Google OAuth callback" })
  async googleCallback(@Request() req, @Response() res: ExpressResponse) {
    // Call login - IMPORTANT: This service MUST set the HttpOnly cookie on the 'res' object.
    // We don't need the return value here if we aren't using the token directly for the redirect.
    await this.authService.login(req.user, res);
    // Log successful cookie setting (assuming login service does it)
    this.logger.log(`Google callback: Cookie should be set. Redirecting to frontend.`);

    const frontendUrl = this.configService.get("FRONTEND_URL", "http://localhost:4000");

    // Redirect WITHOUT the token in the URL
    res.redirect(`${frontendUrl}/auth/google/success`);
  }
}
