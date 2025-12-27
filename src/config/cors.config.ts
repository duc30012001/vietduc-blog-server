import { CorsOptions } from "@nestjs/common/interfaces/external/cors-options.interface";

export const getCorsConfig = (): CorsOptions => {
    const origins = process.env.CORS_ORIGINS?.split(",").map((o) => o.trim()) || [];

    return {
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, Postman, etc.)
            if (!origin) {
                return callback(null, true);
            }

            // Check exact match or pattern match for subdomains
            const isAllowed = origins.some((allowed) => {
                // Wildcard subdomain support: *.example.com
                if (allowed.startsWith("*.")) {
                    const domain = allowed.slice(2);
                    return origin.endsWith(domain) || origin.includes(`.${domain}`);
                }
                // Localhost with any port
                if (allowed === "localhost") {
                    return origin.includes("localhost");
                }
                // Exact match
                return origin === allowed;
            });

            if (isAllowed) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
    };
};
