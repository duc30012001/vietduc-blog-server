import { Controller, Get, Param, Query } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Public } from "../../common/decorators";
import { PaginatedResponseDto } from "../../common/dto";
import {
    PublicCategoryResponseDto,
    PublicPaginationQueryDto,
    PublicPostQueryDto,
    PublicPostResponseDto,
    PublicTagResponseDto,
} from "./dto";
import { PublicService } from "./public.service";

@ApiTags("Public")
@Controller("public")
@Public()
export class PublicController {
    constructor(private readonly publicService: PublicService) {}

    // ==================== CATEGORIES ====================

    @Get("categories")
    @ApiOperation({ summary: "Get all categories as tree structure" })
    @ApiResponse({ status: 200, type: [PublicCategoryResponseDto] })
    async getAllCategories(): Promise<PublicCategoryResponseDto[]> {
        return this.publicService.getAllCategories();
    }

    @Get("categories/:slug")
    @ApiOperation({ summary: "Get a category by slug" })
    @ApiParam({ name: "slug", description: "Category slug" })
    @ApiResponse({ status: 200, type: PublicCategoryResponseDto })
    @ApiResponse({ status: 404, description: "Category not found" })
    async getCategoryBySlug(@Param("slug") slug: string): Promise<PublicCategoryResponseDto> {
        return this.publicService.getCategoryBySlug(slug);
    }

    @Get("categories/:slug/posts")
    @ApiOperation({ summary: "Get posts by category slug" })
    @ApiParam({ name: "slug", description: "Category slug" })
    @ApiResponse({ status: 200, type: PaginatedResponseDto<PublicPostResponseDto> })
    @ApiResponse({ status: 404, description: "Category not found" })
    async getPostsByCategorySlug(
        @Param("slug") slug: string,
        @Query() query: PublicPaginationQueryDto
    ): Promise<PaginatedResponseDto<PublicPostResponseDto>> {
        return this.publicService.getPostsByCategorySlug(slug, query);
    }

    // ==================== POSTS ====================

    @Get("posts")
    @ApiOperation({ summary: "Get all published posts with pagination and filtering" })
    @ApiResponse({ status: 200, type: PaginatedResponseDto<PublicPostResponseDto> })
    async getAllPosts(
        @Query() query: PublicPostQueryDto
    ): Promise<PaginatedResponseDto<PublicPostResponseDto>> {
        return this.publicService.getAllPosts(query);
    }

    @Get("posts/:slug")
    @ApiOperation({ summary: "Get a post by slug" })
    @ApiParam({ name: "slug", description: "Post slug" })
    @ApiResponse({ status: 200, type: PublicPostResponseDto })
    @ApiResponse({ status: 404, description: "Post not found" })
    async getPostBySlug(@Param("slug") slug: string): Promise<PublicPostResponseDto> {
        return this.publicService.getPostBySlug(slug);
    }

    @Get("posts/:slug/related")
    @ApiOperation({ summary: "Get related posts by category or tags" })
    @ApiParam({ name: "slug", description: "Current post slug" })
    @ApiResponse({ status: 200, type: [PublicPostResponseDto] })
    async getRelatedPosts(@Param("slug") slug: string): Promise<PublicPostResponseDto[]> {
        return this.publicService.getRelatedPosts(slug);
    }

    // ==================== TAGS ====================

    @Get("tags")
    @ApiOperation({ summary: "Get all tags with post counts" })
    @ApiResponse({ status: 200, type: [PublicTagResponseDto] })
    async getAllTags(): Promise<PublicTagResponseDto[]> {
        return this.publicService.getAllTags();
    }

    @Get("tags/:slug")
    @ApiOperation({ summary: "Get a tag by slug" })
    @ApiParam({ name: "slug", description: "Tag slug" })
    @ApiResponse({ status: 200, type: PublicTagResponseDto })
    @ApiResponse({ status: 404, description: "Tag not found" })
    async getTagBySlug(@Param("slug") slug: string): Promise<PublicTagResponseDto> {
        return this.publicService.getTagBySlug(slug);
    }

    @Get("tags/:slug/posts")
    @ApiOperation({ summary: "Get posts by tag slug" })
    @ApiParam({ name: "slug", description: "Tag slug" })
    @ApiResponse({ status: 200, type: PaginatedResponseDto<PublicPostResponseDto> })
    @ApiResponse({ status: 404, description: "Tag not found" })
    async getPostsByTagSlug(
        @Param("slug") slug: string,
        @Query() query: PublicPaginationQueryDto
    ): Promise<PaginatedResponseDto<PublicPostResponseDto>> {
        return this.publicService.getPostsByTagSlug(slug, query);
    }
}
