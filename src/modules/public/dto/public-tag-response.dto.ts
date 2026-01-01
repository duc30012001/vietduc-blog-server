import { ApiProperty } from "@nestjs/swagger";
import { Tag } from "../../../generated/prisma/client";

export class PublicTagResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    slug: string;

    @ApiProperty()
    name_vi: string;

    @ApiProperty()
    name_en: string;

    @ApiProperty()
    post_count: number;

    constructor(
        tag: Tag & {
            _count?: { posts: number };
        }
    ) {
        this.id = tag.id;
        this.slug = tag.slug;
        this.name_vi = tag.name_vi;
        this.name_en = tag.name_en;
        this.post_count = tag._count?.posts ?? 0;
    }
}
