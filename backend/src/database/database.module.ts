import { Module, Logger } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const logger = new Logger("DatabaseModule");
        const databaseUrl = configService.get("DATABASE_URL");

        if (!databaseUrl) {
          logger.warn("DATABASE_URL not configured. Using in-memory SQLite for development", "useFactory");
          return {
            type: "sqlite",
            database: ":memory:",
            entities: [__dirname + "/../**/*.entity{.ts,.js}"],
            synchronize: true,
          };
        }

        return {
          type: "postgres",
          url: databaseUrl,
          ssl: configService.get("NODE_ENV") === "production" ? { rejectUnauthorized: false } : false,
          entities: [__dirname + "/../**/*.entity{.ts,.js}"],
          synchronize: configService.get("NODE_ENV") !== "production",
        };
      },
    }),
  ],
})
export class DatabaseModule {}
