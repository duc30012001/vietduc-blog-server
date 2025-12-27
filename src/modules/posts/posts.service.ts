import { Injectable, NotFoundException } from "@nestjs/common";
import slugify from "slugify";
import { PaginatedResponseDto } from "../../common/dto";
import { PostStatus, Prisma } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePostDto, PostQueryDto, PostResponseDto, UpdatePostDto } from "./dto";

@Injectable()
export class PostsService {
    constructor(private readonly prisma: PrismaService) {}

    private generateSlug(name: string): string {
        return slugify(name, { lower: true, strict: true });
    }

    private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existing = await this.prisma.post.findUnique({
                where: { slug },
            });

            if (!existing || existing.id === excludeId) {
                return slug;
            }

            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    private getPostInclude() {
        return {
            creator: { select: { id: true, name: true } },
            modifier: { select: { id: true, name: true } },
            category: { select: { id: true, name_vi: true, name_en: true } },
            tags: {
                include: {
                    tag: { select: { id: true, name_vi: true, name_en: true } },
                },
            },
        };
    }

    async create(dto: CreatePostDto, userId: string): Promise<PostResponseDto> {
        // Validate category
        const category = await this.prisma.category.findUnique({
            where: { id: dto.category_id },
        });
        if (!category) {
            throw new NotFoundException("Danh mục không tồn tại");
        }

        // Generate unique slug from title_en
        const baseSlug = this.generateSlug(dto.title_en);
        const slug = await this.ensureUniqueSlug(baseSlug);

        // Find or create tags by name
        let tagIds: string[] = [];
        if (dto.tags && dto.tags.length > 0) {
            tagIds = await this.findOrCreateTags(dto.tags, userId);
        }

        // Create post with tags
        const post = await this.prisma.post.create({
            data: {
                slug,
                title_vi: dto.title_vi,
                title_en: dto.title_en,
                excerpt_vi: dto.excerpt_vi,
                excerpt_en: dto.excerpt_en,
                content_vi: dto.content_vi,
                content_en: dto.content_en,
                thumbnail: dto.thumbnail,
                status: dto.status || PostStatus.DRAFT,
                category_id: dto.category_id,
                creator_id: userId,
                tags:
                    tagIds.length > 0
                        ? {
                              create: tagIds.map((tagId) => ({
                                  tag: { connect: { id: tagId } },
                              })),
                          }
                        : undefined,
            },
            include: this.getPostInclude(),
        });

        return new PostResponseDto(post);
    }

    private async findOrCreateTags(tagNames: string[], userId: string): Promise<string[]> {
        const tagIds: string[] = [];

        for (const name of tagNames) {
            const trimmedName = name.trim();
            if (!trimmedName) continue;

            // Try to find existing tag by name_vi or name_en
            let existingTag = await this.prisma.tag.findFirst({
                where: {
                    OR: [
                        { name_vi: { equals: trimmedName, mode: "insensitive" } },
                        { name_en: { equals: trimmedName, mode: "insensitive" } },
                    ],
                },
            });

            if (!existingTag) {
                // Create new tag with the same name for both vi and en
                const tagSlug = this.generateSlug(trimmedName);
                const uniqueTagSlug = await this.ensureUniqueTagSlug(tagSlug);

                existingTag = await this.prisma.tag.create({
                    data: {
                        slug: uniqueTagSlug,
                        name_vi: trimmedName,
                        name_en: trimmedName,
                        creator_id: userId,
                    },
                });
            }

            tagIds.push(existingTag.id);
        }

        return tagIds;
    }

    private async ensureUniqueTagSlug(baseSlug: string): Promise<string> {
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existing = await this.prisma.tag.findUnique({
                where: { slug },
            });

            if (!existing) {
                return slug;
            }

            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    async findAll(query: PostQueryDto): Promise<PaginatedResponseDto<PostResponseDto>> {
        const { keyword, page = 1, limit = 20, sort_by, sort_order, status, category_id } = query;

        const where: Prisma.PostWhereInput = {};

        if (keyword) {
            where.OR = [
                { title_vi: { contains: keyword, mode: "insensitive" } },
                { title_en: { contains: keyword, mode: "insensitive" } },
                { slug: { contains: keyword, mode: "insensitive" } },
            ];
        }

        if (status) {
            where.status = status;
        }

        // Filter by category including all descendant categories
        if (category_id) {
            const categoryIds = await this.getCategoryWithDescendants(category_id);
            where.category_id = { in: categoryIds };
        }

        const orderBy: Prisma.PostOrderByWithRelationInput = {};
        if (sort_by) {
            orderBy[sort_by as keyof Prisma.PostOrderByWithRelationInput] = sort_order || "desc";
        } else {
            orderBy.created_at = "desc";
        }

        const total = await this.prisma.post.count({ where });

        const posts = await this.prisma.post.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            include: this.getPostInclude(),
        });

        const data = posts.map((post) => new PostResponseDto(post));

        return new PaginatedResponseDto(data, total, page, limit);
    }

    /**
     * Get a category ID and all its descendant category IDs recursively
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

    async findOne(id: string): Promise<PostResponseDto> {
        const post = await this.prisma.post.findUnique({
            where: { id },
            include: this.getPostInclude(),
        });

        if (!post) {
            throw new NotFoundException("Bài viết không tồn tại");
        }

        return new PostResponseDto(post);
    }

    async update(id: string, dto: UpdatePostDto, userId: string): Promise<PostResponseDto> {
        const existing = await this.prisma.post.findUnique({
            where: { id },
            include: { tags: true },
        });

        if (!existing) {
            throw new NotFoundException("Bài viết không tồn tại");
        }

        // Validate category if changing
        if (dto.category_id) {
            const category = await this.prisma.category.findUnique({
                where: { id: dto.category_id },
            });
            if (!category) {
                throw new NotFoundException("Danh mục không tồn tại");
            }
        }

        // Regenerate slug if title_en changes
        let slug = existing.slug;
        if (dto.title_en && dto.title_en !== existing.title_en) {
            const baseSlug = this.generateSlug(dto.title_en);
            slug = await this.ensureUniqueSlug(baseSlug, id);
        }

        // Determine published_at
        let published_at = existing.published_at;
        if (dto.status === PostStatus.PUBLISHED && existing.status !== PostStatus.PUBLISHED) {
            published_at = new Date();
        }

        // Update tags if provided
        let tagsUpdate: Prisma.PostTagUpdateManyWithoutPostNestedInput | undefined = undefined;
        if (dto.tags !== undefined) {
            const tagIds = dto.tags.length > 0 ? await this.findOrCreateTags(dto.tags, userId) : [];
            tagsUpdate = {
                deleteMany: {},
                create: tagIds.map((tagId) => ({
                    tag: { connect: { id: tagId } },
                })),
            };
        }

        const post = await this.prisma.post.update({
            where: { id },
            data: {
                ...(dto.title_vi && { title_vi: dto.title_vi }),
                ...(dto.title_en && { title_en: dto.title_en, slug }),
                ...(dto.excerpt_vi !== undefined && { excerpt_vi: dto.excerpt_vi }),
                ...(dto.excerpt_en !== undefined && { excerpt_en: dto.excerpt_en }),
                ...(dto.content_vi && { content_vi: dto.content_vi }),
                ...(dto.content_en && { content_en: dto.content_en }),
                ...(dto.thumbnail !== undefined && { thumbnail: dto.thumbnail }),
                ...(dto.status && { status: dto.status, published_at }),
                ...(dto.category_id !== undefined && { category_id: dto.category_id || null }),
                modifier_id: userId,
                tags: tagsUpdate,
            },
            include: this.getPostInclude(),
        });

        return new PostResponseDto(post);
    }

    async delete(id: string): Promise<void> {
        const post = await this.prisma.post.findUnique({
            where: { id },
        });

        if (!post) {
            throw new NotFoundException("Bài viết không tồn tại");
        }

        await this.prisma.post.delete({ where: { id } });
    }
}
