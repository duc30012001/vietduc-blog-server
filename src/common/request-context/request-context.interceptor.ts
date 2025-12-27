import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { RequestContextService } from "./request-context.service";

interface AuthenticatedRequest {
    user?: {
        id?: string;
    };
}

@Injectable()
export class RequestContextInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const userId = request.user?.id;

        return new Observable((subscriber) => {
            RequestContextService.run({ userId }, () => {
                next.handle().subscribe({
                    next: (value) => subscriber.next(value),
                    error: (err) => subscriber.error(err),
                    complete: () => subscriber.complete(),
                });
            });
        });
    }
}
