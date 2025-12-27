import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";
import { PostStatus } from "../../../generated/prisma/client";

export class CreatePostDto {
    @ApiProperty({ description: "Tiêu đề tiếng Việt", maxLength: 255 })
    @IsString()
    @MaxLength(255)
    title_vi: string;

    @ApiProperty({ description: "Tiêu đề tiếng Anh", maxLength: 255 })
    @IsString()
    @MaxLength(255)
    title_en: string;

    @ApiProperty({ description: "Tóm tắt tiếng Việt", maxLength: 500 })
    @IsString()
    @MaxLength(500)
    excerpt_vi: string;

    @ApiProperty({ description: "Tóm tắt tiếng Anh", maxLength: 500 })
    @IsString()
    @MaxLength(500)
    excerpt_en: string;

    @ApiProperty({ description: "Nội dung tiếng Việt (Markdown)" })
    @IsString()
    content_vi: string;

    @ApiProperty({ description: "Nội dung tiếng Anh (Markdown)" })
    @IsString()
    content_en: string;

    @ApiPropertyOptional({ description: "Thumbnail URL", maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    thumbnail?: string;

    @ApiPropertyOptional({ enum: PostStatus, description: "Trạng thái bài viết", default: "DRAFT" })
    @IsOptional()
    @IsEnum(PostStatus)
    status?: PostStatus;

    @ApiProperty({ description: "ID danh mục" })
    @IsUUID()
    category_id: string;

    @ApiPropertyOptional({ description: "Danh sách tên thẻ", type: [String] })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @MaxLength(100, { each: true })
    tags?: string[];
}
