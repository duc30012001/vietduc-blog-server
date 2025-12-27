import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators";
import { PaginatedResponseDto } from "../../common/dto";
import { FirebaseUser } from "../../common/guards/firebase-auth.guard";
import { CreateTagDto, TagQueryDto, TagResponseDto, UpdateTagDto } from "./dto";
import { TagsService } from "./tags.service";

@ApiTags("Tags")
@Controller("tags")
export class TagsController {
    constructor(private readonly tagsService: TagsService) {}

    @Post()
    @ApiOperation({ summary: "Tạo thẻ mới" })
    @ApiResponse({ status: 201, type: TagResponseDto })
    async create(
        @Body() dto: CreateTagDto,
        @CurrentUser() user: FirebaseUser
    ): Promise<TagResponseDto> {
        return this.tagsService.create(dto, user.dbUser!.id);
    }

    @Get()
    @ApiOperation({ summary: "Lấy danh sách thẻ" })
    @ApiResponse({ status: 200, type: PaginatedResponseDto<TagResponseDto> })
    async findAll(@Query() query: TagQueryDto): Promise<PaginatedResponseDto<TagResponseDto>> {
        return this.tagsService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Lấy thông tin thẻ" })
    @ApiResponse({ status: 200, type: TagResponseDto })
    async findOne(@Param("id") id: string): Promise<TagResponseDto> {
        return this.tagsService.findOne(id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Cập nhật thẻ" })
    @ApiResponse({ status: 200, type: TagResponseDto })
    async update(
        @Param("id") id: string,
        @Body() dto: UpdateTagDto,
        @CurrentUser() user: FirebaseUser
    ): Promise<TagResponseDto> {
        return this.tagsService.update(id, dto, user.dbUser!.id);
    }

    @Delete(":id")
    @ApiOperation({ summary: "Xóa thẻ" })
    @ApiResponse({ status: 200 })
    async delete(@Param("id") id: string): Promise<void> {
        return this.tagsService.delete(id);
    }
}
