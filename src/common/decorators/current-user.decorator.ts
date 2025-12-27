import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";
import type { FirebaseUser } from "../guards/firebase-auth.guard";

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): FirebaseUser | undefined => {
        const request = ctx.switchToHttp().getRequest<Request>();
        return request.user;
    }
);
