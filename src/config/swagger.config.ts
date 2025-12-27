import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
// import * as basicAuth from "express-basic-auth";
import { PaginatedResponseDto, PaginationMeta } from "../common/dto/paginated-response.dto";

export const setupSwagger = (app: INestApplication): void => {
    // const configService = app.get(ConfigService);
    // const swaggerUser = configService.get<string>("swagger.user");
    // const swaggerPassword = configService.get<string>("swagger.password");

    // Protect the main API docs with basic auth (not the public docs)
    // if (swaggerUser && swaggerPassword) {
    //     app.use(
    //         ["/api-docs", "/api-docs-json"],
    //         basicAuth({
    //             challenge: true,
    //             users: {
    //                 [swaggerUser]: swaggerPassword,
    //             },
    //         })
    //     );
    // }

    // ===================== Full API Documentation (Protected) =====================
    const fullConfig = new DocumentBuilder()
        .setTitle("Viet Duc Blog Server API")
        .setDescription("API documentation for Viet Duc Blog Server - Full Documentation")
        .setVersion("2.0")
        .addBearerAuth(
            {
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT",
                name: "JWT",
                description: "Enter JWT token",
                in: "header",
            },
            "JWT-auth"
        )
        .build();

    const fullDocument = SwaggerModule.createDocument(app, fullConfig, {
        extraModels: [PaginatedResponseDto, PaginationMeta],
    });

    SwaggerModule.setup("api-docs", app, fullDocument, {
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: "none",
            filter: true,
            showRequestDuration: true,
        },
    });
};
