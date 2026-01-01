import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class PublicPostQueryDto {
    @ApiPropertyOptional({ description: "Search keyword for title, content, or slug" })
    @IsOptional()
    @IsString()
    keyword?: string;

    @ApiPropertyOptional({ description: "Filter by category ID" })
    @IsOptional()
    @IsUUID()
    category_id?: string;

    @ApiPropertyOptional({ description: "Filter by category slug" })
    @IsOptional()
    @IsString()
    category_slug?: string;

    @ApiPropertyOptional({ description: "Filter by tag ID" })
    @IsOptional()
    @IsUUID()
    tag_id?: string;

    @ApiPropertyOptional({ description: "Filter by tag slug" })
    @IsOptional()
    @IsString()
    tag_slug?: string;

    @ApiPropertyOptional({ description: "Page number", default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ description: "Items per page", default: 10 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 10;
}
