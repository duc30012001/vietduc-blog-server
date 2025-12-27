import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    ArrayNotEmpty,
    IsArray,
    IsInt,
    IsOptional,
    IsUUID,
    Min,
    ValidateNested,
} from "class-validator";

export class BulkUpdateOrderItemDto {
    @ApiProperty({ description: "ID của danh mục" })
    @IsUUID()
    id: string;

    @ApiProperty({ description: "ID danh mục cha mới (null nếu là root)" })
    @IsOptional()
    @IsUUID()
    parent_id?: string | null;

    @ApiProperty({ description: "Thứ tự mới" })
    @IsInt()
    @Min(0)
    order: number;
}

export class BulkUpdateOrderDto {
    @ApiProperty({ type: [BulkUpdateOrderItemDto], description: "Danh sách cập nhật thứ tự" })
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => BulkUpdateOrderItemDto)
    items: BulkUpdateOrderItemDto[];
}
