import { Injectable, NotFoundException } from "@nestjs/common";
import slugify from "slugify";
import { PaginatedResponseDto } from "../../common/dto";
import { Prisma } from "../../generated/prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateTagDto, TagQueryDto, TagResponseDto, UpdateTagDto } from "./dto";

@Injectable()
export class TagsService {
    constructor(private readonly prisma: PrismaService) {}

    private generateSlug(name: string): string {
        return slugify(name, { lower: true, strict: true });
    }

    private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existing = await this.prisma.tag.findUnique({
                where: { slug },
            });

            if (!existing || existing.id === excludeId) {
                return slug;
            }

            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    private getTagInclude() {
        return {
            creator: { select: { id: true, name: true } },
            modifier: { select: { id: true, name: true } },
        };
    }

    async create(dto: CreateTagDto, userId: string): Promise<TagResponseDto> {
        const baseSlug = this.generateSlug(dto.name_en);
        const slug = await this.ensureUniqueSlug(baseSlug);

        const tag = await this.prisma.tag.create({
            data: {
                slug,
                name_vi: dto.name_vi,
                name_en: dto.name_en,
                creator_id: userId,
            },
            include: this.getTagInclude(),
        });

        return new TagResponseDto(tag);
    }

    async findAll(query: TagQueryDto): Promise<PaginatedResponseDto<TagResponseDto>> {
        const { keyword, page = 1, limit = 20, sort_by, sort_order } = query;

        const where: Prisma.TagWhereInput = {};

        if (keyword) {
            where.OR = [
                { name_vi: { contains: keyword, mode: "insensitive" } },
                { name_en: { contains: keyword, mode: "insensitive" } },
                { slug: { contains: keyword, mode: "insensitive" } },
            ];
        }

        const orderBy: Prisma.TagOrderByWithRelationInput = {};
        if (sort_by) {
            orderBy[sort_by as keyof Prisma.TagOrderByWithRelationInput] = sort_order || "desc";
        } else {
            orderBy.created_at = "desc";
        }

        const total = await this.prisma.tag.count({ where });

        const tags = await this.prisma.tag.findMany({
            where,
            orderBy,
            skip: (page - 1) * limit,
            take: limit,
            include: this.getTagInclude(),
        });

        const data = tags.map((tag) => new TagResponseDto(tag));

        return new PaginatedResponseDto(data, total, page, limit);
    }

    async findOne(id: string): Promise<TagResponseDto> {
        const tag = await this.prisma.tag.findUnique({
            where: { id },
            include: this.getTagInclude(),
        });

        if (!tag) {
            throw new NotFoundException("Thẻ không tồn tại");
        }

        return new TagResponseDto(tag);
    }

    async update(id: string, dto: UpdateTagDto, userId: string): Promise<TagResponseDto> {
        const existing = await this.prisma.tag.findUnique({
            where: { id },
        });

        if (!existing) {
            throw new NotFoundException("Thẻ không tồn tại");
        }

        // Regenerate slug if name_en changes
        let slug = existing.slug;
        if (dto.name_en && dto.name_en !== existing.name_en) {
            const baseSlug = this.generateSlug(dto.name_en);
            slug = await this.ensureUniqueSlug(baseSlug, id);
        }

        const tag = await this.prisma.tag.update({
            where: { id },
            data: {
                ...(dto.name_vi && { name_vi: dto.name_vi }),
                ...(dto.name_en && { name_en: dto.name_en, slug }),
                modifier_id: userId,
            },
            include: this.getTagInclude(),
        });

        return new TagResponseDto(tag);
    }

    async delete(id: string): Promise<void> {
        const tag = await this.prisma.tag.findUnique({
            where: { id },
        });

        if (!tag) {
            throw new NotFoundException("Thẻ không tồn tại");
        }

        // Delete related PostTag entries first, then the tag
        await this.prisma.$transaction([
            this.prisma.postTag.deleteMany({ where: { tag_id: id } }),
            this.prisma.tag.delete({ where: { id } }),
        ]);
    }
}
