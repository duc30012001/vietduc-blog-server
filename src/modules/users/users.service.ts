import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { PaginatedResponseDto } from "../../common/dto";
import { FirebaseService, FirebaseUserRecord } from "../../common/firebase/firebase.service";
import { FirebaseUser } from "../../common/guards/firebase-auth.guard";
import { AuthProvider, Prisma } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { UserQueryDto, UserResponseDto } from "./dto";

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly firebaseService: FirebaseService
    ) {}

    /**
     * Sync Firebase user to database.
     * Creates user if not exists, updates if exists.
     * Called after successful Firebase authentication.
     */
    async syncFirebaseUser(
        firebaseUser: FirebaseUser | FirebaseUserRecord
    ): Promise<UserResponseDto> {
        const { uid, email, displayName, photoURL } = firebaseUser;

        if (!email) {
            throw new Error("Firebase user must have an email");
        }

        // Determine provider based on Firebase auth method
        const provider = this.getProviderFromFirebaseUid(uid);

        // Try to find existing user by email
        let user = await this.prisma.user.findUnique({
            where: { email },
            include: { accounts: true },
        });

        if (user) {
            // Update existing user info
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    name: displayName || user.name,
                    avatar: photoURL || user.avatar,
                    is_verified: true,
                },
                include: { accounts: true },
            });

            // Check if this provider account exists
            const accountExists = user.accounts.some(
                (acc) => acc.provider === provider && acc.provider_id === uid
            );

            if (!accountExists) {
                // Link new provider to existing user
                await this.prisma.userAccount.create({
                    data: {
                        user_id: user.id,
                        provider,
                        provider_id: uid,
                    },
                });
            }
        } else {
            // Create new user with provider account
            user = await this.prisma.user.create({
                data: {
                    email,
                    name: displayName || email.split("@")[0],
                    avatar: photoURL,
                    is_verified: true,
                    accounts: {
                        create: {
                            provider,
                            provider_id: uid,
                        },
                    },
                },
                include: { accounts: true },
            });
        }

        return new UserResponseDto(user);
    }

    /**
     * Sync ALL users from Firebase to database
     * Returns the count of synced users
     */
    async syncAllFirebaseUsers(): Promise<{ synced: number; total: number; errors: string[] }> {
        const firebaseUsers = await this.firebaseService.listAllUsers();
        const errors: string[] = [];
        let synced = 0;

        for (const firebaseUser of firebaseUsers) {
            if (!firebaseUser.email) {
                errors.push(`User ${firebaseUser.uid} has no email, skipped`);
                continue;
            }

            try {
                await this.syncFirebaseUser(firebaseUser);
                synced++;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : "Unknown error";
                errors.push(`Failed to sync user ${firebaseUser.email}: ${errorMessage}`);
                this.logger.error(`Failed to sync user ${firebaseUser.email}`, error);
            }
        }

        this.logger.log(`Synced ${synced}/${firebaseUsers.length} users from Firebase`);

        return {
            synced,
            total: firebaseUsers.length,
            errors,
        };
    }

    private getProviderFromFirebaseUid(uid: string): AuthProvider {
        // Firebase Google users have UIDs that don't contain special patterns
        // Email/password users have UIDs that are random strings
        // This is a simplified approach - you may need to adjust based on your needs
        if (uid.includes("google")) {
            return AuthProvider.GOOGLE;
        }
        if (uid.includes("facebook")) {
            return AuthProvider.FACEBOOK;
        }
        return AuthProvider.EMAIL;
    }

    async findById(id: string): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        return new UserResponseDto(user);
    }

    async update(
        id: string,
        data: { name?: string; avatar?: string; role?: string }
    ): Promise<UserResponseDto> {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            throw new NotFoundException("User not found");
        }

        const updatedUser = await this.prisma.user.update({
            where: { id },
            data: {
                ...(data.name && { name: data.name }),
                ...(data.avatar && { avatar: data.avatar }),
                ...(data.role && { role: data.role as "ADMIN" | "USER" }),
            },
        });

        return new UserResponseDto(updatedUser);
    }

    async findByFirebaseUid(uid: string): Promise<UserResponseDto | null> {
        const account = await this.prisma.userAccount.findFirst({
            where: { provider_id: uid },
            include: { user: true },
        });

        return account ? new UserResponseDto(account.user) : null;
    }

    async findAll(query: UserQueryDto): Promise<PaginatedResponseDto<UserResponseDto>> {
        const { keyword, page = 1, limit = 20, sort_by, sort_order, role, is_verified } = query;

        // Build where clause
        const where: Prisma.UserWhereInput = {};

        if (keyword) {
            where.OR = [
                { name: { contains: keyword, mode: "insensitive" } },
                { email: { contains: keyword, mode: "insensitive" } },
            ];
        }

        if (role) {
            where.role = role;
        }

        if (is_verified !== undefined) {
            where.is_verified = is_verified;
        }

        // Build orderBy
        const orderBy: Prisma.UserOrderByWithRelationInput = {};
        if (sort_by) {
            orderBy[sort_by as keyof Prisma.UserOrderByWithRelationInput] = sort_order || "desc";
        } else {
            orderBy.created_at = "desc";
        }

        // Get total count
        const total = await this.prisma.user.count({ where });

        // Get paginated data
        const users = await this.prisma.user.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
        });

        const data = users.map((user) => new UserResponseDto(user));

        return new PaginatedResponseDto(data, total, page, limit);
    }

    async findByEmail(email: string): Promise<UserResponseDto | null> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        return user ? new UserResponseDto(user) : null;
    }

    async getCurrentUser(firebaseUser: FirebaseUser): Promise<UserResponseDto> {
        // First try to find by Firebase UID
        const existingUser = await this.findByFirebaseUid(firebaseUser.uid);

        if (existingUser) {
            return existingUser;
        }

        // If not found, sync and return
        return this.syncFirebaseUser(firebaseUser);
    }
}
