import { Injectable } from "@nestjs/common";
import { AsyncLocalStorage } from "async_hooks";

export interface RequestContext {
    userId?: string;
}

@Injectable()
export class RequestContextService {
    private static asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

    /**
     * Run a callback within a request context
     */
    static run<T>(context: RequestContext, callback: () => T): T {
        return this.asyncLocalStorage.run(context, callback);
    }

    /**
     * Get the current request context
     */
    static getContext(): RequestContext | undefined {
        return this.asyncLocalStorage.getStore();
    }

    /**
     * Get the current user ID from the context
     */
    static getCurrentUserId(): string | undefined {
        return this.getContext()?.userId;
    }

    /**
     * Instance method to get current user ID (for dependency injection usage)
     */
    getCurrentUserId(): string | undefined {
        return RequestContextService.getCurrentUserId();
    }
}
