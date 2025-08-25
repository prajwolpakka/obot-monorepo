import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { ChatModule } from "./chat/chat.module";
import { ChatbotsModule } from "./chatbots/chatbots.module";
import { CountriesModule } from "./countries/countries.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { DatabaseModule } from "./database/database.module";
import { DocumentsModule } from "./documents/documents.module";
import { MailModule } from "./mail/mail.module";
import { SubscriptionModule } from "./subscription/subscription.module";
import { TokensModule } from "./tokens/tokens.module";
import { UsersModule } from "./users/users.module";
import { NotificationModule } from "./notifications/notification.module";
import { PaymentModule } from "./payment/payment.module";
import { SettingsModule } from "./settings/settings.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    MailModule,
    TokensModule,
    CountriesModule,
    DashboardModule,
    ChatbotsModule,
    ChatModule,
    DocumentsModule,
    SubscriptionModule,
    NotificationModule,
    PaymentModule,
    SettingsModule,
  ],
})
export class AppModule {}
