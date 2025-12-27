import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators";
import { PaginatedResponseDto } from "../../common/dto";
import { FirebaseUser } from "../../common/guards/firebase-auth.guard";
import { CreatePostDto, PostQueryDto, PostResponseDto, UpdatePostDto } from "./dto";
import { PostsService } from "./posts.service";

@ApiTags("Posts")
@Controller("posts")
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Post()
    @ApiOperation({ summary: "Tạo bài viết mới" })
    @ApiResponse({ status: 201, type: PostResponseDto })
    async create(
        @Body() dto: CreatePostDto,
        @CurrentUser() user: FirebaseUser
    ): Promise<PostResponseDto> {
        return this.postsService.create(dto, user.dbUser!.id);
    }

    @Get()
    @ApiOperation({ summary: "Lấy danh sách bài viết có phân trang" })
    @ApiResponse({ status: 200, type: PaginatedResponseDto })
    async findAll(@Query() query: PostQueryDto): Promise<PaginatedResponseDto<PostResponseDto>> {
        return this.postsService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Lấy chi tiết bài viết theo ID" })
    @ApiResponse({ status: 200, type: PostResponseDto })
    @ApiResponse({ status: 404, description: "Bài viết không tồn tại" })
    async findOne(@Param("id") id: string): Promise<PostResponseDto> {
        return this.postsService.findOne(id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Cập nhật bài viết" })
    @ApiResponse({ status: 200, type: PostResponseDto })
    @ApiResponse({ status: 404, description: "Bài viết không tồn tại" })
    async update(
        @Param("id") id: string,
        @Body() dto: UpdatePostDto,
        @CurrentUser() user: FirebaseUser
    ): Promise<PostResponseDto> {
        return this.postsService.update(id, dto, user.dbUser!.id);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Xóa bài viết" })
    @ApiResponse({ status: 200, description: "Đã xóa thành công" })
    @ApiResponse({ status: 404, description: "Bài viết không tồn tại" })
    async delete(@Param("id") id: string): Promise<void> {
        return this.postsService.delete(id);
    }
}
