import { Injectable, NotFoundException } from "@nestjs/common";
import { PaginatedResponseDto } from "../../common/dto";
import { PostStatus, Prisma } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
    PublicCategoryResponseDto,
    PublicPaginationQueryDto,
    PublicPostQueryDto,
    PublicPostResponseDto,
    PublicTagResponseDto,
    SitemapItemDto,
    SitemapResponseDto,
} from "./dto";

@Injectable()
export class PublicService {
    constructor(private readonly prisma: PrismaService) {}

    // ==================== CATEGORIES ====================

    /**
     * Get all categories as a tree structure with post counts
     */
    async getAllCategories(): Promise<PublicCategoryResponseDto[]> {
        const categories = await this.prisma.category.findMany({
            orderBy: { order: "asc" },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });

        // Build tree structure
        const categoryMap = new Map<string, PublicCategoryResponseDto>();
        const roots: PublicCategoryResponseDto[] = [];

        // First pass: create all nodes
        for (const cat of categories) {
            const dto = new PublicCategoryResponseDto(cat);
            dto.children = [];
            categoryMap.set(cat.id, dto);
        }

        // Second pass: build tree
        for (const cat of categories) {
            const dto = categoryMap.get(cat.id)!;
            if (cat.parent_id && categoryMap.has(cat.parent_id)) {
                categoryMap.get(cat.parent_id)!.children!.push(dto);
            } else {
                roots.push(dto);
            }
        }

        return roots;
    }

    /**
     * Get a single category by slug
     */
    async getCategoryBySlug(slug: string): Promise<PublicCategoryResponseDto> {
        const category = await this.prisma.category.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });

        if (!category) {
            throw new NotFoundException("Category not found");
        }

        return new PublicCategoryResponseDto(category);
    }

    // ==================== POSTS ====================

    private getPublicPostInclude() {
        return {
            creator: { select: { id: true, name: true, avatar: true } },
            category: { select: { id: true, slug: true, name_vi: true, name_en: true } },
            tags: {
                include: {
                    tag: { select: { id: true, slug: true, name_vi: true, name_en: true } },
                },
            },
        };
    }

    /**
     * Get all published posts with pagination and filtering
     */
    async getAllPosts(
        query: PublicPostQueryDto
    ): Promise<PaginatedResponseDto<PublicPostResponseDto>> {
        const {
            keyword,
            page = 1,
            limit = 10,
            category_id,
            category_slug,
            tag_id,
            tag_slug,
        } = query;

        const where: Prisma.PostWhereInput = {
            status: PostStatus.PUBLISHED,
        };

        // Keyword search (includes post fields, category name, and tag name)
        if (keyword) {
            where.OR = [
                { title_vi: { contains: keyword, mode: "insensitive" } },
                { title_en: { contains: keyword, mode: "insensitive" } },
                { excerpt_vi: { contains: keyword, mode: "insensitive" } },
                { excerpt_en: { contains: keyword, mode: "insensitive" } },
                { slug: { contains: keyword, mode: "insensitive" } },
                // Search by category name
                { category: { name_vi: { contains: keyword, mode: "insensitive" } } },
                { category: { name_en: { contains: keyword, mode: "insensitive" } } },
                // Search by tag name
                {
                    tags: {
                        some: { tag: { name_vi: { contains: keyword, mode: "insensitive" } } },
                    },
                },
                {
                    tags: {
                        some: { tag: { name_en: { contains: keyword, mode: "insensitive" } } },
                    },
                },
            ];
        }

        // Filter by category (including descendants)
        if (category_id) {
            const categoryIds = await this.getCategoryWithDescendants(category_id);
            where.category_id = { in: categoryIds };
        } else if (category_slug) {
            const category = await this.prisma.category.findUnique({
                where: { slug: category_slug },
            });
            if (category) {
                const categoryIds = await this.getCategoryWithDescendants(category.id);
                where.category_id = { in: categoryIds };
            }
        }

        // Filter by tag
        if (tag_id) {
            where.tags = { some: { tag_id } };
        } else if (tag_slug) {
            const tag = await this.prisma.tag.findUnique({
                where: { slug: tag_slug },
            });
            if (tag) {
                where.tags = { some: { tag_id: tag.id } };
            }
        }

        const total = await this.prisma.post.count({ where });

        const posts = await this.prisma.post.findMany({
            where,
            orderBy: { published_at: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            include: this.getPublicPostInclude(),
        });

        const data = posts.map((post) => new PublicPostResponseDto(post));

        return new PaginatedResponseDto(data, total, page, limit);
    }

    /**
     * Get a single post by slug (published only)
     */
    async getPostBySlug(slug: string): Promise<PublicPostResponseDto> {
        const post = await this.prisma.post.findUnique({
            where: { slug },
            include: this.getPublicPostInclude(),
        });

        if (!post || post.status !== PostStatus.PUBLISHED) {
            throw new NotFoundException("Post not found");
        }

        // Increment view count asynchronously
        this.prisma.post
            .update({
                where: { id: post.id },
                data: { view_count: { increment: 1 } },
            })
            .catch(() => {
                // Silently ignore view count update failures
            });

        return new PublicPostResponseDto(post);
    }

    /**
     * Get related posts by category or tags
     */
    async getRelatedPosts(slug: string, limit: number = 12): Promise<PublicPostResponseDto[]> {
        const currentPost = await this.prisma.post.findUnique({
            where: { slug },
            include: { tags: true },
        });

        if (!currentPost) {
            return [];
        }

        const tagIds = currentPost.tags.map((t) => t.tag_id);

        const relatedPosts = await this.prisma.post.findMany({
            where: {
                id: { not: currentPost.id },
                status: PostStatus.PUBLISHED,
                OR: [
                    { category_id: currentPost.category_id },
                    { tags: { some: { tag_id: { in: tagIds } } } },
                ],
            },
            orderBy: { published_at: "desc" },
            take: limit,
            include: this.getPublicPostInclude(),
        });

        return relatedPosts.map((post) => new PublicPostResponseDto(post));
    }

    /**
     * Get posts by category slug with pagination
     */
    async getPostsByCategorySlug(
        categorySlug: string,
        query: PublicPaginationQueryDto
    ): Promise<PaginatedResponseDto<PublicPostResponseDto>> {
        const { keyword, page = 1, limit = 10 } = query;

        const category = await this.prisma.category.findUnique({
            where: { slug: categorySlug },
        });

        if (!category) {
            throw new NotFoundException("Category not found");
        }

        const categoryIds = await this.getCategoryWithDescendants(category.id);

        const where: Prisma.PostWhereInput = {
            status: PostStatus.PUBLISHED,
            category_id: { in: categoryIds },
        };

        if (keyword) {
            where.AND = [
                {
                    OR: [
                        { title_vi: { contains: keyword, mode: "insensitive" } },
                        { title_en: { contains: keyword, mode: "insensitive" } },
                        { excerpt_vi: { contains: keyword, mode: "insensitive" } },
                        { excerpt_en: { contains: keyword, mode: "insensitive" } },
                        { slug: { contains: keyword, mode: "insensitive" } },
                    ],
                },
            ];
        }

        const total = await this.prisma.post.count({ where });

        const posts = await this.prisma.post.findMany({
            where,
            orderBy: { published_at: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            include: this.getPublicPostInclude(),
        });

        const data = posts.map((post) => new PublicPostResponseDto(post));

        return new PaginatedResponseDto(data, total, page, limit);
    }

    /**
     * Get posts by tag slug with pagination
     */
    async getPostsByTagSlug(
        tagSlug: string,
        query: PublicPaginationQueryDto
    ): Promise<PaginatedResponseDto<PublicPostResponseDto>> {
        const { keyword, page = 1, limit = 10 } = query;

        const tag = await this.prisma.tag.findUnique({
            where: { slug: tagSlug },
        });

        if (!tag) {
            throw new NotFoundException("Tag not found");
        }

        const where: Prisma.PostWhereInput = {
            status: PostStatus.PUBLISHED,
            tags: { some: { tag_id: tag.id } },
        };

        if (keyword) {
            where.AND = [
                {
                    OR: [
                        { title_vi: { contains: keyword, mode: "insensitive" } },
                        { title_en: { contains: keyword, mode: "insensitive" } },
                        { excerpt_vi: { contains: keyword, mode: "insensitive" } },
                        { excerpt_en: { contains: keyword, mode: "insensitive" } },
                        { slug: { contains: keyword, mode: "insensitive" } },
                    ],
                },
            ];
        }

        const total = await this.prisma.post.count({ where });

        const posts = await this.prisma.post.findMany({
            where,
            orderBy: { published_at: "desc" },
            skip: (page - 1) * limit,
            take: limit,
            include: this.getPublicPostInclude(),
        });

        const data = posts.map((post) => new PublicPostResponseDto(post));

        return new PaginatedResponseDto(data, total, page, limit);
    }

    /**
     * Get category ID and all its descendant category IDs recursively
     */
    private async getCategoryWithDescendants(categoryId: string): Promise<string[]> {
        const result: string[] = [categoryId];

        const children = await this.prisma.category.findMany({
            where: { parent_id: categoryId },
            select: { id: true },
        });

        for (const child of children) {
            const descendantIds = await this.getCategoryWithDescendants(child.id);
            result.push(...descendantIds);
        }

        return result;
    }

    // ==================== TAGS ====================

    /**
     * Get all tags with post counts
     */
    async getAllTags(): Promise<PublicTagResponseDto[]> {
        const tags = await this.prisma.tag.findMany({
            orderBy: { name_en: "asc" },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });

        return tags.map((tag) => new PublicTagResponseDto(tag));
    }

    /**
     * Get a single tag by slug
     */
    async getTagBySlug(slug: string): Promise<PublicTagResponseDto> {
        const tag = await this.prisma.tag.findUnique({
            where: { slug },
            include: {
                _count: {
                    select: { posts: true },
                },
            },
        });

        if (!tag) {
            throw new NotFoundException("Tag not found");
        }

        return new PublicTagResponseDto(tag);
    }

    // ==================== SITEMAP ====================

    async getSitemapData(): Promise<SitemapResponseDto> {
        const [posts, categories, tags] = await Promise.all([
            // Get all published posts
            this.prisma.post.findMany({
                where: { status: PostStatus.PUBLISHED },
                orderBy: { published_at: "desc" },
                take: 10000,
                select: { slug: true, updated_at: true, published_at: true },
            }),
            // Get all categories
            this.prisma.category.findMany({
                select: { slug: true, updated_at: true },
            }),
            // Get all tags
            this.prisma.tag.findMany({
                select: { slug: true, updated_at: true },
            }),
        ]);

        return new SitemapResponseDto({
            posts: posts.map(
                (p) =>
                    new SitemapItemDto({
                        slug: p.slug,
                        updated_at: p.published_at || p.updated_at,
                    })
            ),
            categories: categories.map(
                (c) => new SitemapItemDto({ slug: c.slug, updated_at: c.updated_at })
            ),
            tags: tags.map((t) => new SitemapItemDto({ slug: t.slug, updated_at: t.updated_at })),
        });
    }
}
