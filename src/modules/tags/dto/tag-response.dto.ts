import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Tag } from "../../../generated/prisma/client";

class UserBriefDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    name: string;
}

export class TagResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    slug: string;

    @ApiProperty()
    name_vi: string;

    @ApiProperty()
    name_en: string;

    @ApiPropertyOptional({ type: UserBriefDto })
    creator?: UserBriefDto;

    @ApiPropertyOptional({ type: UserBriefDto })
    modifier?: UserBriefDto;

    @ApiProperty()
    created_at: Date;

    @ApiProperty()
    updated_at: Date;

    constructor(
        tag: Tag & {
            creator?: { id: string; name: string };
            modifier?: { id: string; name: string } | null;
        }
    ) {
        this.id = tag.id;
        this.slug = tag.slug;
        this.name_vi = tag.name_vi;
        this.name_en = tag.name_en;
        this.created_at = tag.created_at;
        this.updated_at = tag.updated_at;

        if (tag.creator) {
            this.creator = {
                id: tag.creator.id,
                name: tag.creator.name,
            };
        }

        if (tag.modifier) {
            this.modifier = {
                id: tag.modifier.id,
                name: tag.modifier.name,
            };
        }
    }
}
