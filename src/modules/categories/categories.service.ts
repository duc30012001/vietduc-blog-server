import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import slugify from "slugify";
import { PaginatedResponseDto } from "../../common/dto";
import { Prisma } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import {
    BulkUpdateOrderDto,
    CategoryQueryDto,
    CategoryResponseDto,
    CreateCategoryDto,
    UpdateCategoryDto,
} from "./dto";

@Injectable()
export class CategoriesService {
    constructor(private readonly prisma: PrismaService) {}

    private generateSlug(name: string): string {
        return slugify(name, { lower: true, strict: true });
    }

    private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existing = await this.prisma.category.findUnique({
                where: { slug },
            });

            if (!existing || existing.id === excludeId) {
                return slug;
            }

            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    async create(dto: CreateCategoryDto, userId: string): Promise<CategoryResponseDto> {
        // Validate parent exists if provided
        if (dto.parent_id) {
            const parent = await this.prisma.category.findUnique({
                where: { id: dto.parent_id },
            });
            if (!parent) {
                throw new NotFoundException("Danh mục cha không tồn tại");
            }
        }

        // Generate unique slug from name_en
        const baseSlug = this.generateSlug(dto.name_en);
        const slug = await this.ensureUniqueSlug(baseSlug);

        // Get max order for the parent level
        const maxOrder = await this.prisma.category.aggregate({
            _max: { order: true },
            where: { parent_id: dto.parent_id ?? null },
        });

        const category = await this.prisma.category.create({
            data: {
                slug,
                name_vi: dto.name_vi,
                name_en: dto.name_en,
                description: dto.description,
                parent_id: dto.parent_id,
                order: (maxOrder._max.order ?? -1) + 1,
                creator_id: userId,
            },
            include: {
                creator: { select: { id: true, name: true } },
                modifier: { select: { id: true, name: true } },
            },
        });

        return new CategoryResponseDto(category);
    }

    async findAll(query: CategoryQueryDto): Promise<PaginatedResponseDto<CategoryResponseDto>> {
        const { keyword, page = 1, limit = 20, sort_by, sort_order, parent_id } = query;

        const where: Prisma.CategoryWhereInput = {};

        if (keyword) {
            where.OR = [
                { name_vi: { contains: keyword, mode: "insensitive" } },
                { name_en: { contains: keyword, mode: "insensitive" } },
                { slug: { contains: keyword, mode: "insensitive" } },
            ];
        }

        if (parent_id !== undefined) {
            where.parent_id = parent_id || null;
        }

        const orderBy: Prisma.CategoryOrderByWithRelationInput = {};
        if (sort_by) {
            orderBy[sort_by as keyof Prisma.CategoryOrderByWithRelationInput] = sort_order || "asc";
        } else {
            orderBy.order = "asc";
        }

        const total = await this.prisma.category.count({ where });

        const categories = await this.prisma.category.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            include: {
                creator: { select: { id: true, name: true } },
                modifier: { select: { id: true, name: true } },
            },
        });

        const data = categories.map((cat) => new CategoryResponseDto(cat));

        return new PaginatedResponseDto(data, total, page, limit);
    }

    async findTree(): Promise<CategoryResponseDto[]> {
        // Get all categories ordered by order
        const categories = await this.prisma.category.findMany({
            orderBy: { order: "asc" },
            include: {
                creator: { select: { id: true, name: true } },
                modifier: { select: { id: true, name: true } },
            },
        });

        // Build tree structure
        const categoryMap = new Map<string, CategoryResponseDto>();
        const roots: CategoryResponseDto[] = [];

        // First pass: create all nodes
        for (const cat of categories) {
            const dto = new CategoryResponseDto(cat);
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

    async findOne(id: string): Promise<CategoryResponseDto> {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                creator: { select: { id: true, name: true } },
                modifier: { select: { id: true, name: true } },
                children: {
                    orderBy: { order: "asc" },
                },
            },
        });

        if (!category) {
            throw new NotFoundException("Danh mục không tồn tại");
        }

        return new CategoryResponseDto(category);
    }

    async update(id: string, dto: UpdateCategoryDto, userId: string): Promise<CategoryResponseDto> {
        const existing = await this.prisma.category.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException("Danh mục không tồn tại");
        }

        // Validate parent if changing
        if (dto.parent_id !== undefined && dto.parent_id !== existing.parent_id) {
            if (dto.parent_id === id) {
                throw new ConflictException("Danh mục không thể là cha của chính nó");
            }
            if (dto.parent_id) {
                const parent = await this.prisma.category.findUnique({
                    where: { id: dto.parent_id },
                });
                if (!parent) {
                    throw new NotFoundException("Danh mục cha không tồn tại");
                }
            }
        }

        // Regenerate slug if name_en changes
        let slug = existing.slug;
        if (dto.name_en && dto.name_en !== existing.name_en) {
            const baseSlug = this.generateSlug(dto.name_en);
            slug = await this.ensureUniqueSlug(baseSlug, id);
        }

        const category = await this.prisma.category.update({
            where: { id },
            data: {
                ...(dto.name_vi && { name_vi: dto.name_vi }),
                ...(dto.name_en && { name_en: dto.name_en, slug }),
                ...(dto.description !== undefined && { description: dto.description }),
                ...(dto.parent_id !== undefined && { parent_id: dto.parent_id || null }),
                modifier_id: userId,
            },
            include: {
                creator: { select: { id: true, name: true } },
                modifier: { select: { id: true, name: true } },
            },
        });

        return new CategoryResponseDto(category);
    }

    async bulkUpdateOrder(dto: BulkUpdateOrderDto, userId: string): Promise<{ updated: number }> {
        const updates = dto.items.map((item) =>
            this.prisma.category.update({
                where: { id: item.id },
                data: {
                    parent_id: item.parent_id ?? null,
                    order: item.order,
                    modifier_id: userId,
                },
            })
        );

        await this.prisma.$transaction(updates);

        return { updated: dto.items.length };
    }

    async delete(id: string): Promise<void> {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: { children: true },
        });

        if (!category) {
            throw new NotFoundException("Danh mục không tồn tại");
        }

        // Recursively delete all children first
        if (category.children.length > 0) {
            for (const child of category.children) {
                await this.delete(child.id);
            }
        }

        await this.prisma.category.delete({ where: { id } });
    }
}
