import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Category } from "../../../generated/prisma/client";

class UserBriefDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;
}

export class CategoryResponseDto {
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

    @ApiPropertyOptional({ type: () => [CategoryResponseDto] })
    children?: CategoryResponseDto[];

    @ApiPropertyOptional({ type: UserBriefDto })
    creator?: UserBriefDto;

    @ApiPropertyOptional({ type: UserBriefDto })
    modifier?: UserBriefDto;

    @ApiProperty()
    created_at: Date;

    @ApiProperty()
    updated_at: Date;

    constructor(
        category: Category & {
            children?: Category[];
            creator?: { id: string; name: string };
            modifier?: { id: string; name: string } | null;
        }
    ) {
        this.id = category.id;
        this.slug = category.slug;
        this.name_vi = category.name_vi;
        this.name_en = category.name_en;
        this.description = category.description ?? undefined;
        this.order = category.order;
        this.parent_id = category.parent_id ?? undefined;
        this.created_at = category.created_at;
        this.updated_at = category.updated_at;

        if (category.creator) {
            this.creator = {
                id: category.creator.id,
                name: category.creator.name,
            };
        }

        if (category.modifier) {
            this.modifier = {
                id: category.modifier.id,
                name: category.modifier.name,
            };
        }

        if (category.children) {
            this.children = category.children.map(
                (child) => new CategoryResponseDto(child as typeof category)
            );
        }
    }
}
