import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import * as compression from "compression";
import helmet from "helmet";
import { join } from "path";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security
  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(",") || [
      "http://localhost:4200",
      "http://localhost:4201",
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix("api");

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Static files for uploads
  app.useStaticAssets(join(__dirname, "..", "uploads"), { prefix: "/uploads" });

  // Swagger
  const config = new DocumentBuilder()
    .setTitle("Complementary Fashions API")
    .setDescription(
      "E-Commerce API for Complementary Fashions crochet clothing store",
    )
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 Server running on http://localhost:${port}/api`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}
bootstrap();
