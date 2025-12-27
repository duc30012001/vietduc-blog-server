import * as Joi from "joi";

export const validationSchema = Joi.object({
    // Application
    PORT: Joi.number().default(3000),
    NODE_ENV: Joi.string()
        .valid("development", "production", "test", "provision")
        .default("development"),

    // Database
    DATABASE_URL: Joi.string().required(),

    // Swagger
    SWAGGER_USER: Joi.string().optional().default("admin"),
    SWAGGER_PASSWORD: Joi.string().optional().default("admin"),

    // CORS
    CORS_ORIGINS: Joi.string().optional().default("http://localhost:3000"),
});
