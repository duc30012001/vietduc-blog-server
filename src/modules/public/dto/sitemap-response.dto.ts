import { ApiProperty } from "@nestjs/swagger";

export class SitemapItemDto {
    @ApiProperty()
    slug: string;

    @ApiProperty()
    updated_at: Date;

    constructor(partial: Partial<SitemapItemDto>) {
        Object.assign(this, partial);
    }
}

export class SitemapResponseDto {
    @ApiProperty({ type: [SitemapItemDto] })
    posts: SitemapItemDto[];

    @ApiProperty({ type: [SitemapItemDto] })
    categories: SitemapItemDto[];

    @ApiProperty({ type: [SitemapItemDto] })
    tags: SitemapItemDto[];

    constructor(partial: Partial<SitemapResponseDto>) {
        Object.assign(this, partial);
    }
}
