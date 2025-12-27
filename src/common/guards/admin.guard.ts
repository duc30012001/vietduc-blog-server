import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { UserRole } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";
import { FirebaseUser } from "./firebase-auth.guard";

export const IS_ADMIN_KEY = "isAdmin";

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Check if route is public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        const firebaseUser = request.user as FirebaseUser | undefined;

        if (!firebaseUser) {
            throw new ForbiddenException("User not authenticated");
        }

        // Find user in database and check role
        const userAccount = await this.prisma.userAccount.findFirst({
            where: { provider_id: firebaseUser.uid },
            include: { user: true },
        });

        if (!userAccount) {
            throw new ForbiddenException("User not found in database");
        }

        if (userAccount.user.role !== UserRole.ADMIN) {
            throw new ForbiddenException("Admin access required");
        }

        // Attach dbUser to request for use in controllers
        firebaseUser.dbUser = {
            id: userAccount.user.id,
            role: userAccount.user.role,
        };

        return true;
    }
}
