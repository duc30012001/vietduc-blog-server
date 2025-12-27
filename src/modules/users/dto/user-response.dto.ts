import { ApiProperty } from "@nestjs/swagger";
import { Exclude, Expose } from "class-transformer";
import { UserRole } from "../../../generated/prisma/client";

@Exclude()
export class UserResponseDto {
    @Expose()
    @ApiProperty()
    id: string;

    @Expose()
    @ApiProperty()
    email: string;

    @Expose()
    @ApiProperty()
    name: string;

    @Expose()
    @ApiProperty({ nullable: true, type: "string" })
    avatar: string | null;

    @Expose()
    @ApiProperty({ enum: ["ADMIN", "USER"] })
    role: UserRole;

    @Expose()
    @ApiProperty()
    is_verified: boolean;

    @Expose()
    @ApiProperty()
    created_at: Date;

    @Expose()
    @ApiProperty()
    updated_at: Date;

    constructor(partial: Partial<UserResponseDto>) {
        Object.assign(this, partial);
    }
}
