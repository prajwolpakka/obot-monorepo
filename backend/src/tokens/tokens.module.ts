import { Module, forwardRef } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TokensService } from "./tokens.service";
import { Token } from "./entities/token.entity";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Token]), forwardRef(() => AuthModule)],
  providers: [TokensService],
  exports: [TokensService],
})
export class TokensModule {}
