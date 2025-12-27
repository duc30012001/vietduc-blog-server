import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { UserRole } from "../../../generated/prisma/client";

export class UpdateUserDto {
    @ApiPropertyOptional({ description: "Tên người dùng" })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: "Avatar URL" })
    @IsOptional()
    @IsString()
    avatar?: string;

    @ApiPropertyOptional({ enum: UserRole, description: "Vai trò người dùng" })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}
