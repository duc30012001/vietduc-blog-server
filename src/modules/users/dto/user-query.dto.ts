import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";
import { BaseQueryDto } from "../../../common/dto";
import { UserRole } from "../../../generated/prisma/client";

export class UserQueryDto extends BaseQueryDto {
    @ApiPropertyOptional({ enum: UserRole, description: "Lọc theo vai trò" })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional({ description: "Lọc theo trạng thái xác thực" })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === "true" || value === true)
    is_verified?: boolean;
}
