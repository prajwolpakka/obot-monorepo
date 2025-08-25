import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
  forwardRef,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { Response } from "express";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { IMessageResponse } from "../common/interfaces/common.interface";
import { MailService } from "../mail/mail.service";
import { TokenType } from "../tokens/entities/token.entity";
import { TokensService } from "../tokens/tokens.service";
import type { User } from "../users/entities/user.entity";
import { UsersService } from "../users/users.service";
import type { ChangePasswordDto } from "./dto/change-password.dto";
import type { ForgotPasswordDto } from "./dto/forgot-password.dto";
import type { ResetPasswordDto } from "./dto/reset-password.dto";
import type { SignupDto } from "./dto/signup.dto";
import type { VerifyEmailDto } from "./dto/verify-email.dto";
import { ILoginResponse, ISignupResponse } from "./interfaces/auth.interface";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @Inject(forwardRef(() => MailService))
    private mailService: MailService,
    @Inject(forwardRef(() => TokensService))
    private tokensService: TokensService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException({
        message: "Email not verified. Please check your email for verification instructions.",
        code: "EMAIL_NOT_VERIFIED",
        email: user.email,
      });
    }

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    throw new UnauthorizedException("Invalid credentials");
  }

  private setCookieToken(res: Response, token: string) {
    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });
  }

  async login(user: User, res: Response): Promise<ILoginResponse> {
    const payload = {
      sub: user.id,
    };
    this.logger.log(`JWT Payload created: ${JSON.stringify(payload)}`, "login");

    const token = this.jwtService.sign(payload);
    this.setCookieToken(res, token);

    const { password, ...userWithoutPassword } = user;

    return {
      message: "Login successful",
      user: userWithoutPassword,
    };
  }

  async logout(res: Response): Promise<IMessageResponse> {
    res.clearCookie("auth_token", {
      httpOnly: true,
      secure: this.configService.get("NODE_ENV") === "production",
      sameSite: "lax",
    });

    return {
      message: "Logout successful",
    };
  }

  async signup(signupDto: SignupDto): Promise<ISignupResponse> {
    const { email, password, fullName } = signupDto;

    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser) {
      throw new ConflictException("Email already registered");
    }

    // Create a new user with unverified email (password hashing is handled in usersService.create)
    const newUser = await this.usersService.create({
      email: email.toLowerCase(),
      password,
      fullName,
      isEmailVerified: false,
    });

    const verificationToken = await this.tokensService.createToken(
      newUser.id,
      TokenType.EMAIL_VERIFICATION,
      24 // 24 hours expiry
    );

    try {
      await this.mailService.sendVerificationEmail(newUser.email, newUser.fullName, verificationToken.token);
      this.logger.log(`Verification email sent to ${newUser.email}`, "signup");
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${error.message}`, "signup");
      throw new InternalServerErrorException("Failed to send verification email. Please try again later.");
    }

    return {
      message: "Signup successful. Verification email sent.",
      email: newUser.email,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto): Promise<IMessageResponse> {
    const { token } = verifyEmailDto;

    // Find token (even if expired)
    const verificationToken = await this.tokensService.findTokenByString(token, TokenType.EMAIL_VERIFICATION);

    if (!verificationToken) {
      throw new BadRequestException("Invalid verification token");
    }

    // Check if token is expired
    const isExpired = await this.tokensService.isTokenExpired(verificationToken);
    if (isExpired) {
      throw new BadRequestException("Verification token has expired");
    }

    // Find user
    const user = await this.usersService.findOne(verificationToken.userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.isEmailVerified) {
      // Delete the token since it's no longer needed
      await this.tokensService.deleteToken(verificationToken.id);
      return {
        message: "Email already verified",
      };
    }

    // Update user
    await this.usersService.update(user.id, { isEmailVerified: true });

    // Delete the token since it's been used
    await this.tokensService.deleteToken(verificationToken.id);

    return {
      message: "Email verified successfully",
    };
  }

  async resendVerificationEmail(email: string): Promise<IMessageResponse> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.isEmailVerified) {
      throw new BadRequestException("Email already verified");
    }

    // Generate new verification token
    const verificationToken = await this.tokensService.createToken(
      user.id,
      TokenType.EMAIL_VERIFICATION,
      24 // 24 hours expiry
    );

    // Send verification email
    try {
      await this.mailService.sendVerificationEmail(user.email, user.fullName, verificationToken.token);
      return {
        message: "Verification email sent successfully",
      };
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${error.message}`);
      throw new InternalServerErrorException("Failed to send verification email");
    }
  }

  async resendVerificationEmailByToken(token: string): Promise<IMessageResponse> {
    // Find the token (even if expired)
    const verificationToken = await this.tokensService.findTokenByString(token, TokenType.EMAIL_VERIFICATION);

    if (!verificationToken) {
      throw new BadRequestException("Invalid token");
    }

    // Find user
    const user = await this.usersService.findOne(verificationToken.userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.isEmailVerified) {
      throw new BadRequestException("Email already verified");
    }

    // Generate new verification token
    const newVerificationToken = await this.tokensService.createToken(
      user.id,
      TokenType.EMAIL_VERIFICATION,
      24 // 24 hours expiry
    );

    // Send verification email
    try {
      await this.mailService.sendVerificationEmail(user.email, user.fullName, newVerificationToken.token);
      return {
        message: "Verification email sent successfully",
      };
    } catch (error) {
      this.logger.error(`Failed to send verification email: ${error.message}`);
      throw new InternalServerErrorException("Failed to send verification email");
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<IMessageResponse> {
    const { email } = forgotPasswordDto;

    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // To prevent user enumeration, we'll return the same message
      this.logger.warn(`Password reset requested for non-existent email: ${email}`);
      return {
        message: "If an account with that email exists, a password reset link has been sent.",
      };
    }

    // Generate password reset token
    const resetToken = await this.tokensService.createToken(
      user.id,
      TokenType.PASSWORD_RESET,
      1 // 1 hour expiry
    );

    // Send password reset email
    try {
      await this.mailService.sendPasswordResetEmail(user.email, user.fullName, resetToken.token);
      this.logger.log(`Password reset email sent to ${user.email}`);
      return {
        message: "If an account with that email exists, a password reset link has been sent.",
      };
    } catch (error) {
      this.logger.error(`Failed to send password reset email: ${error.message}`);
      throw new InternalServerErrorException("Failed to send password reset email");
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<IMessageResponse> {
    const { token, password } = resetPasswordDto;

    // Find token
    const resetToken = await this.tokensService.findTokenByString(token, TokenType.PASSWORD_RESET);

    if (!resetToken) {
      throw new BadRequestException("Invalid or expired password reset token");
    }

    // Check if token is expired
    const isExpired = await this.tokensService.isTokenExpired(resetToken);
    if (isExpired) {
      throw new BadRequestException("Invalid or expired password reset token");
    }

    // Find user
    const user = await this.usersService.findOne(resetToken.userId);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Update user password (hashing is handled in usersService.update)
    await this.usersService.update(user.id, { password });

    // Delete the token
    await this.tokensService.deleteToken(resetToken.id);

    return {
      message: "Password reset successfully",
    };
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<IMessageResponse> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Find user
    const user = await this.usersService.findOne(userId);

    // Verify old password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException("Incorrect old password");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    await this.usersService.update(userId, { password: hashedPassword });

    return {
      message: "Password changed successfully",
    };
  }

  async validateGoogleUser(user: CreateUserDto) {
    const existingUser = await this.usersService.findByEmail(user.email);
    if (existingUser) return existingUser;
    return await this.usersService.create(user);
  }
}
