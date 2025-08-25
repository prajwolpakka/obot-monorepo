import { ClassSerializerInterceptor, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory, Reflector } from "@nestjs/core";
import { IoAdapter } from "@nestjs/platform-socket.io";
import { SwaggerModule } from "@nestjs/swagger";
import * as cookieParser from "cookie-parser";
import { json, urlencoded } from "express";
import { AppModule } from "./app.module";
import { swaggerConfig } from "./common/config/swagger.config";
import { CustomLogger } from "./common/logger/custom-logger.service";
import { apiLimiter, authLimiter, uploadLimiter } from "./common/middleware/rate-limit.middleware";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLogger(),
  });
  const configService = app.get(ConfigService);

  // Get frontend URL from environment variables
  const frontendUrl = configService.get<string>("FRONTEND_URL", "http://localhost:4000");

  // Configure CORS FIRST before any other middleware
  app.enableCors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "http://localhost:4000",
        "http://localhost:3000",
        "http://localhost:8080",
        "http://127.0.0.1:4000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8080",
        frontendUrl,
      ];

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("CORS blocked origin:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
      "Cookie",
      "Set-Cookie",
      "Access-Control-Allow-Credentials",
      "Access-Control-Allow-Origin",
    ],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Add explicit OPTIONS handler for all routes
  app.use((req, res, next) => {
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
      res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS,PATCH");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie"
      );
      res.header("Access-Control-Allow-Credentials", "true");
      res.sendStatus(204);
    } else {
      next();
    }
  });

  // Configure WebSocket adapter
  app.useWebSocketAdapter(new IoAdapter(app));

  // Apply rate limiting
  app.use("/api/auth", authLimiter);
  app.use("/api/documents/upload", uploadLimiter);
  app.use("/api", apiLimiter);

  // Configure cookie parser
  app.use(cookieParser());

  // Configure body parsing with raw body for Stripe webhooks
  app.use(
    "/api/payment/webhook",
    json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf.toString("utf-8");
      },
    })
  );

  app.use(json({ limit: "10mb" }));
  app.use(urlencoded({ extended: true, limit: "10mb" }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    })
  );

  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: false,
    })
  );

  app.setGlobalPrefix("api");

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document, {
    customfavIcon: "/favicon.ico",
    customSiteTitle: "Chatbot Platform API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "none",
      filter: true,
      showRequestDuration: true,
    },
  });

  const port = configService.get("PORT", 4001);
  await app.listen(port);
  const baseUrl = await app.getUrl();
  console.log(`Application is running on: ${baseUrl}`);
  console.log(`API endpoints available at: ${baseUrl}/api`);
  console.log(`Swagger documentation available at: ${baseUrl}/api/docs`);
}
bootstrap();
