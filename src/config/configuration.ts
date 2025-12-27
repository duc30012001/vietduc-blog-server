export default () => ({
    port: parseInt(process.env.PORT || "3000", 10),
    nodeEnv: process.env.NODE_ENV || "development",
    cors: {
        origins: process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()) || [
            "http://localhost:3000",
        ],
    },
    swagger: {
        user: process.env.SWAGGER_USER || "admin",
        password: process.env.SWAGGER_PASSWORD || "admin",
    },
});
