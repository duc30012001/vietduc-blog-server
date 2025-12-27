import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";
import { BaseQueryDto } from "../../../common/dto";

export class CategoryQueryDto extends BaseQueryDto {
    @ApiPropertyOptional({ description: "Lọc theo danh mục cha" })
    @IsOptional()
    @IsUUID()
    parent_id?: string;
}
