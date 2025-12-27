import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

/**
 * Recursively removes sensitive fields from objects
 * Currently removes: password
 */
function sanitizeObject(obj: unknown): unknown {
    // Handle null/undefined
    if (obj === null || obj === undefined) {
        return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
        return obj.map((item) => sanitizeObject(item));
    }

    // Handle Date objects (don't iterate over them)
    if (obj instanceof Date) {
        return obj;
    }

    // Handle plain objects
    if (typeof obj === "object") {
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
            // Skip sensitive fields
            if (key === "password" || key === "key_hash") {
                continue;
            }
            // Recursively sanitize nested objects
            sanitized[key] = sanitizeObject(value);
        }
        return sanitized;
    }

    // Return primitives as-is
    return obj;
}

/**
 * Global interceptor to remove sensitive fields from all API responses
 * This ensures password and other sensitive data never leak to clients
 */
@Injectable()
export class SanitizeResponseInterceptor implements NestInterceptor {
    intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
        return next.handle().pipe(map((data) => sanitizeObject(data)));
    }
}
