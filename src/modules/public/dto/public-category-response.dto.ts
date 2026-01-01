import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Category } from "../../../generated/prisma/client";

export class PublicCategoryResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    slug: string;

    @ApiProperty()
    name_vi: string;

    @ApiProperty()
    name_en: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiProperty()
    order: number;

    @ApiPropertyOptional()
    parent_id?: string;

    @ApiPropertyOptional({ type: () => [PublicCategoryResponseDto] })
    children?: PublicCategoryResponseDto[];

    @ApiProperty()
    post_count: number;

    constructor(
        category: Category & {
            children?: Category[];
            _count?: { posts: number };
        }
    ) {
        this.id = category.id;
        this.slug = category.slug;
        this.name_vi = category.name_vi;
        this.name_en = category.name_en;
        this.description = category.description ?? undefined;
        this.order = category.order;
        this.parent_id = category.parent_id ?? undefined;
        this.post_count = category._count?.posts ?? 0;

        if (category.children) {
            this.children = category.children.map(
                (child) => new PublicCategoryResponseDto(child as typeof category)
            );
        }
    }
}
