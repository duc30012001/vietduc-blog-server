import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class CreateCategoryDto {
    @ApiProperty({ description: "Tên danh mục tiếng Việt", maxLength: 100 })
    @IsString()
    @MaxLength(100)
    name_vi: string;

    @ApiProperty({ description: "Tên danh mục tiếng Anh", maxLength: 100 })
    @IsString()
    @MaxLength(100)
    name_en: string;

    @ApiPropertyOptional({ description: "Mô tả danh mục", maxLength: 500 })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiPropertyOptional({ description: "ID danh mục cha" })
    @IsOptional()
    @IsUUID()
    parent_id?: string;
}
