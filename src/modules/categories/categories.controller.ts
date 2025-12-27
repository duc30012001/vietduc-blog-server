import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators";
import { PaginatedResponseDto } from "../../common/dto";
import { FirebaseUser } from "../../common/guards/firebase-auth.guard";
import { CategoriesService } from "./categories.service";
import {
    BulkUpdateOrderDto,
    CategoryQueryDto,
    CategoryResponseDto,
    CreateCategoryDto,
    UpdateCategoryDto,
} from "./dto";

@ApiTags("Categories")
@Controller("categories")
export class CategoriesController {
    constructor(private readonly categoriesService: CategoriesService) {}

    @Post()
    @ApiOperation({ summary: "Tạo danh mục mới" })
    @ApiResponse({ status: 201, type: CategoryResponseDto })
    async create(
        @Body() dto: CreateCategoryDto,
        @CurrentUser() user: FirebaseUser
    ): Promise<CategoryResponseDto> {
        return this.categoriesService.create(dto, user.dbUser!.id);
    }

    @Get()
    @ApiOperation({ summary: "Lấy danh sách danh mục có phân trang" })
    @ApiResponse({ status: 200, type: PaginatedResponseDto })
    async findAll(
        @Query() query: CategoryQueryDto
    ): Promise<PaginatedResponseDto<CategoryResponseDto>> {
        return this.categoriesService.findAll(query);
    }

    @Get("tree")
    @ApiOperation({ summary: "Lấy cây danh mục" })
    @ApiResponse({ status: 200, type: [CategoryResponseDto] })
    async findTree(): Promise<CategoryResponseDto[]> {
        return this.categoriesService.findTree();
    }

    @Get(":id")
    @ApiOperation({ summary: "Lấy chi tiết danh mục theo ID" })
    @ApiResponse({ status: 200, type: CategoryResponseDto })
    @ApiResponse({ status: 404, description: "Danh mục không tồn tại" })
    async findOne(@Param("id") id: string): Promise<CategoryResponseDto> {
        return this.categoriesService.findOne(id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Cập nhật danh mục" })
    @ApiResponse({ status: 200, type: CategoryResponseDto })
    @ApiResponse({ status: 404, description: "Danh mục không tồn tại" })
    async update(
        @Param("id") id: string,
        @Body() dto: UpdateCategoryDto,
        @CurrentUser() user: FirebaseUser
    ): Promise<CategoryResponseDto> {
        return this.categoriesService.update(id, dto, user.dbUser!.id);
    }

    @Post("bulk-update-order")
    @ApiOperation({ summary: "Cập nhật hàng loạt thứ tự và cha của danh mục (cho drag-drop)" })
    @ApiResponse({ status: 200 })
    async bulkUpdateOrder(
        @Body() dto: BulkUpdateOrderDto,
        @CurrentUser() user: FirebaseUser
    ): Promise<{ updated: number }> {
        return this.categoriesService.bulkUpdateOrder(dto, user.dbUser!.id);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Xóa danh mục" })
    @ApiResponse({ status: 200, description: "Đã xóa thành công" })
    @ApiResponse({ status: 404, description: "Danh mục không tồn tại" })
    async delete(@Param("id") id: string): Promise<void> {
        return this.categoriesService.delete(id);
    }
}
