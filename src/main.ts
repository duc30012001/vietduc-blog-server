import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { GlobalExceptionFilter } from "./common/filters/http-exception.filter";
import { SanitizeResponseInterceptor, TransformInterceptor } from "./common/interceptors";
import { getCorsConfig } from "./config/cors.config";
import { setupSwagger } from "./config/swagger.config";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const logger = new Logger("Bootstrap");

    // Global prefix for all routes
    app.setGlobalPrefix("v1");

    // CORS configuration
    app.enableCors(getCorsConfig());

    // Global validation pipe with class-validator and class-transformer
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Strip properties not in DTO
            forbidNonWhitelisted: true, // Throw error for unknown properties
            transform: true, // Auto-transform payloads to DTO instances
            transformOptions: {
                enableImplicitConversion: false, // Disable to prevent "false" string → true bug
            },
        })
    );

    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Global response interceptors
    // SanitizeResponseInterceptor removes sensitive fields (password, key_hash)
    // TransformInterceptor wraps response in standard format
    app.useGlobalInterceptors(new SanitizeResponseInterceptor(), new TransformInterceptor());

    // Swagger documentation (available at /api-docs)
    setupSwagger(app);

    const port = process.env.PORT || 3000;
    await app.listen(port);

    logger.log(`🚀 Application running on: http://localhost:${port}/v1`);
    logger.log(`📚 Swagger docs available at: http://localhost:${port}/api-docs`);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
