import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { type Repository, LessThan, MoreThan } from "typeorm";
import { Token, type TokenType } from "./entities/token.entity";
import { v4 as uuidv4 } from "uuid";

@Injectable()
export class TokensService {
  private readonly logger = new Logger(TokensService.name);

  constructor(
    @InjectRepository(Token)
    private tokensRepository: Repository<Token>
  ) {
    // Clean up expired tokens periodically
    this.logger.log("Setting up periodic cleanup of expired tokens (every hour)", "constructor");
    setInterval(() => this.cleanupExpiredTokens(), 1000 * 60 * 60); // Every hour
  }

  async createToken(userId: string, type: TokenType, expiresInHours: number): Promise<Token> {
    this.logger.log(`Creating token for user ${userId}, type: ${type}, expiry: ${expiresInHours} hours`, "createToken");
    try {
      const token = this.tokensRepository.create({
        userId,
        token: uuidv4(),
        type,
        expiresAt: new Date(Date.now() + expiresInHours * 60 * 60 * 1000),
      });
      const savedToken = await this.tokensRepository.save(token);
      this.logger.log(`Token created successfully for user ${userId}, ID: ${savedToken.id}`, "createToken");
      return savedToken;
    } catch (error) {
      this.logger.error(`Failed to create token for user ${userId}: ${error.message}`, "createToken");
      throw error;
    }
  }

  async findToken(tokenString: string, type: TokenType): Promise<Token | null> {
    this.logger.log(`Finding token string ${tokenString.substring(0, 8)}... type: ${type}`, "findToken");
    // First check if the token exists at all
    const token = await this.tokensRepository.findOne({
      where: {
        token: tokenString,
        type,
      },
    });

    if (!token) {
      this.logger.warn(`Token string ${tokenString.substring(0, 8)}... type: ${type} not found`, "findToken");
      return null;
    }

    // Check if the token is expired
    if (token.expiresAt < new Date()) {
      this.logger.warn(`Token ${token.id} found but is expired`, "findToken");
      return null;
    }
    this.logger.log(`Valid token found: ${token.id}`, "findToken");
    return token;
  }

  async findTokenByString(tokenString: string, type: TokenType): Promise<Token | null> {
    this.logger.log(
      `Finding token (even if expired) string ${tokenString.substring(0, 8)}... type: ${type}`,
      "findTokenByString"
    );
    const token = await this.tokensRepository.findOne({
      where: {
        token: tokenString,
        type,
      },
    });
    if (token) {
      this.logger.log(`Token found (may be expired): ${token.id}`, "findTokenByString");
    } else {
      this.logger.warn(`Token string ${tokenString.substring(0, 8)}... type: ${type} not found`, "findTokenByString");
    }
    return token;
  }

  async isTokenExpired(token: Token): Promise<boolean> {
    const expired = token.expiresAt < new Date();
    this.logger.log(`Checking if token ${token.id} is expired: ${expired}`, "isTokenExpired");
    return expired;
  }

  async deleteToken(id: string): Promise<void> {
    this.logger.log(`Deleting token with ID: ${id}`, "deleteToken");
    await this.tokensRepository.delete(id);
    this.logger.log(`Token deleted successfully: ${id}`, "deleteToken");
  }

  async deleteTokensByUserAndType(userId: string, type: TokenType): Promise<void> {
    this.logger.log(`Deleting tokens for user ${userId}, type: ${type}`, "deleteTokensByUserAndType");
    const result = await this.tokensRepository.delete({ userId, type });
    this.logger.log(
      `Deleted ${result.affected || 0} tokens for user ${userId}, type: ${type}`,
      "deleteTokensByUserAndType"
    );
  }

  async cleanupExpiredTokens(): Promise<void> {
    this.logger.log("Starting cleanup of expired tokens", "cleanupExpiredTokens");
    try {
      const result = await this.tokensRepository.delete({
        expiresAt: LessThan(new Date()),
      });
      this.logger.log(
        `Expired token cleanup finished. Removed ${result.affected || 0} tokens.`,
        "cleanupExpiredTokens"
      );
    } catch (error) {
      this.logger.error(`Failed to cleanup expired tokens: ${error.message}`, "cleanupExpiredTokens");
    }
  }
}
