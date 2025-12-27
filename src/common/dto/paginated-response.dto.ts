import { ApiProperty } from "@nestjs/swagger";

export class PaginationMeta {
    @ApiProperty({ description: "Tổng số bản ghi" })
    total: number;

    @ApiProperty({ description: "Trang hiện tại" })
    page: number;

    @ApiProperty({ description: "Số bản ghi mỗi trang" })
    limit: number;

    @ApiProperty({ description: "Tổng số trang" })
    totalPages: number;

    @ApiProperty({ description: "Có trang tiếp theo" })
    hasNextPage: boolean;

    @ApiProperty({ description: "Có trang trước" })
    hasPreviousPage: boolean;
}

export class PaginatedResponseDto<T> {
    @ApiProperty({ description: "Danh sách bản ghi" })
    data: T[];

    @ApiProperty({ description: "Thông tin phân trang", type: PaginationMeta })
    meta: PaginationMeta;

    constructor(data: T[], total: number, page: number, limit: number) {
        this.data = data;
        this.meta = {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            hasNextPage: page < Math.ceil(total / limit),
            hasPreviousPage: page > 1,
        };
    }
}
