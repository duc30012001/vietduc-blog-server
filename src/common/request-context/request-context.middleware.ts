import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { RequestContextService } from "./request-context.service";

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        // Use Firebase user's uid as the userId
        const userId = req.user?.uid;

        RequestContextService.run({ userId }, () => {
            next();
        });
    }
}
