import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export enum SortOrder {
    ASC = "asc",
    DESC = "desc",
}

export class BaseQueryDto {
    @ApiPropertyOptional({ description: "Từ khóa tìm kiếm" })
    @IsOptional()
    @IsString()
    keyword?: string;

    @ApiPropertyOptional({ minimum: 1, default: 1, description: "Số trang" })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({
        minimum: 1,
        maximum: 1000,
        default: 10,
        description: "Số bản ghi mỗi trang",
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(1000)
    @IsOptional()
    limit?: number = 20;

    @ApiPropertyOptional({ description: "Trường sắp xếp" })
    @IsOptional()
    @IsString()
    sort_by?: string;

    @ApiPropertyOptional({ enum: SortOrder, description: "Thứ tự sắp xếp" })
    @IsOptional()
    @IsEnum(SortOrder)
    sort_order?: SortOrder;

    get skip(): number {
        return ((this.page || 1) - 1) * (this.limit || 20);
    }
}
