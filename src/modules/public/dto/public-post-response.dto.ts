import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Post } from "../../../generated/prisma/client";

class CategoryBriefDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    slug: string;

    @ApiProperty()
    name_vi: string;

    @ApiProperty()
    name_en: string;
}

class TagBriefDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    slug: string;

    @ApiProperty()
    name_vi: string;

    @ApiProperty()
    name_en: string;
}

class AuthorBriefDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;

    @ApiPropertyOptional()
    avatar?: string;
}

export class PublicPostResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    slug: string;

    @ApiProperty()
    title_vi: string;

    @ApiProperty()
    title_en: string;

    @ApiPropertyOptional({ nullable: true })
    excerpt_vi: string | null;

    @ApiPropertyOptional({ nullable: true })
    excerpt_en: string | null;

    @ApiProperty()
    content_vi: string;

    @ApiProperty()
    content_en: string;

    @ApiPropertyOptional({ nullable: true })
    thumbnail: string | null;

    @ApiProperty()
    view_count: number;

    @ApiPropertyOptional({ nullable: true })
    published_at: Date | null;

    @ApiPropertyOptional({ type: CategoryBriefDto, nullable: true })
    category: CategoryBriefDto | null;

    @ApiProperty({ type: [TagBriefDto] })
    tags: TagBriefDto[];

    @ApiPropertyOptional({ type: AuthorBriefDto })
    author?: AuthorBriefDto;

    @ApiProperty()
    created_at: Date;

    constructor(
        post: Post & {
            creator?: { id: string; name: string; avatar: string | null };
            category?: { id: string; slug: string; name_vi: string; name_en: string } | null;
            tags?: { tag: { id: string; slug: string; name_vi: string; name_en: string } }[];
        }
    ) {
        this.id = post.id;
        this.slug = post.slug;
        this.title_vi = post.title_vi;
        this.title_en = post.title_en;
        this.excerpt_vi = post.excerpt_vi ?? null;
        this.excerpt_en = post.excerpt_en ?? null;
        this.content_vi = post.content_vi;
        this.content_en = post.content_en;
        this.thumbnail = post.thumbnail ?? null;
        this.view_count = post.view_count;
        this.published_at = post.published_at ?? null;
        this.created_at = post.created_at;

        if (post.creator) {
            this.author = {
                id: post.creator.id,
                name: post.creator.name,
                avatar: post.creator.avatar ?? undefined,
            };
        }

        this.category = post.category
            ? {
                  id: post.category.id,
                  slug: post.category.slug,
                  name_vi: post.category.name_vi,
                  name_en: post.category.name_en,
              }
            : null;

        this.tags = post.tags
            ? post.tags.map((pt) => ({
                  id: pt.tag.id,
                  slug: pt.tag.slug,
                  name_vi: pt.tag.name_vi,
                  name_en: pt.tag.name_en,
              }))
            : [];
    }
}
