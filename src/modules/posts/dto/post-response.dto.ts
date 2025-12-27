import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Post, PostStatus } from "../../../generated/prisma/client";

class UserBriefDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;
}

class CategoryBriefDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name_vi: string;

    @ApiProperty()
    name_en: string;
}

class TagBriefDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name_vi: string;

    @ApiProperty()
    name_en: string;
}

export class PostResponseDto {
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

    @ApiProperty({ enum: PostStatus })
    status: PostStatus;

    @ApiProperty()
    view_count: number;

    @ApiPropertyOptional({ nullable: true })
    published_at: Date | null;

    @ApiPropertyOptional({ nullable: true })
    category_id: string | null;

    @ApiPropertyOptional({ type: CategoryBriefDto, nullable: true })
    category: CategoryBriefDto | null;

    @ApiProperty({ type: [TagBriefDto] })
    tags: TagBriefDto[];

    @ApiPropertyOptional({ type: UserBriefDto })
    creator?: UserBriefDto;

    @ApiPropertyOptional({ type: UserBriefDto })
    modifier?: UserBriefDto;

    @ApiProperty()
    created_at: Date;

    @ApiProperty()
    updated_at: Date;

    constructor(
        post: Post & {
            creator?: { id: string; name: string };
            modifier?: { id: string; name: string } | null;
            category?: { id: string; name_vi: string; name_en: string } | null;
            tags?: { tag: { id: string; name_vi: string; name_en: string } }[];
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
        this.status = post.status;
        this.view_count = post.view_count;
        this.published_at = post.published_at ?? null;
        this.category_id = post.category_id ?? null;
        this.created_at = post.created_at;
        this.updated_at = post.updated_at;

        if (post.creator) {
            this.creator = {
                id: post.creator.id,
                name: post.creator.name,
            };
        }

        if (post.modifier) {
            this.modifier = {
                id: post.modifier.id,
                name: post.modifier.name,
            };
        }

        this.category = post.category
            ? {
                  id: post.category.id,
                  name_vi: post.category.name_vi,
                  name_en: post.category.name_en,
              }
            : null;

        this.tags = post.tags
            ? post.tags.map((pt) => ({
                  id: pt.tag.id,
                  name_vi: pt.tag.name_vi,
                  name_en: pt.tag.name_en,
              }))
            : [];
    }
}
