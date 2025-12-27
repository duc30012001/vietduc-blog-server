import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsUUID } from "class-validator";
import { BaseQueryDto } from "../../../common/dto";
import { PostStatus } from "../../../generated/prisma/client";

export class PostQueryDto extends BaseQueryDto {
    @ApiPropertyOptional({ enum: PostStatus, description: "Lọc theo trạng thái" })
    @IsOptional()
    @IsEnum(PostStatus)
    status?: PostStatus;

    @ApiPropertyOptional({ description: "Lọc theo danh mục" })
    @IsOptional()
    @IsUUID()
    category_id?: string;
}
