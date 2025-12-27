import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { IS_PUBLIC_KEY } from "../decorators";
import { FirebaseService } from "../firebase/firebase.service";

export interface FirebaseUser {
    uid: string;
    email?: string;
    emailVerified?: boolean;
    displayName?: string;
    photoURL?: string;
}

declare module "express" {
    interface Request {
        user?: FirebaseUser;
    }
}

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    constructor(
        private firebaseService: FirebaseService,
        private reflector: Reflector
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException("No auth token provided");
        }

        const decodedToken = await this.firebaseService.verifyIdToken(token);

        if (!decodedToken) {
            throw new UnauthorizedException("Invalid auth token");
        }

        request.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            displayName: decodedToken.name as string | undefined,
            photoURL: decodedToken.picture,
        };

        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(" ") ?? [];
        return type === "Bearer" ? token : undefined;
    }
}
