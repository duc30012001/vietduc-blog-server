import { ApiProperty } from "@nestjs/swagger";

export class SocialLinkDto {
    @ApiProperty({
        example: "https://example.com/icons/facebook.svg",
        description: "URL to the social media icon/logo",
    })
    logo: string;

    @ApiProperty({ example: "Facebook", description: "Display name for the social link" })
    name: string;

    @ApiProperty({
        example: "https://facebook.com/yourpage",
        description: "URL to the social media page",
    })
    url: string;

    @ApiProperty({ example: true, description: "Whether this link is visible" })
    enabled: boolean;
}

export class FooterSocialLinksDto {
    @ApiProperty({ type: [SocialLinkDto] })
    links: SocialLinkDto[];
}

export class FooterContactEmailDto {
    @ApiProperty({ example: "contact@example.com" })
    email: string;
}

export class SiteSettingResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    key: string;

    @ApiProperty()
    value: unknown;

    @ApiProperty()
    created_at: Date;

    @ApiProperty()
    updated_at: Date;
}

export class FooterSettingsResponseDto {
    @ApiProperty({ type: [SocialLinkDto] })
    socialLinks: SocialLinkDto[];

    @ApiProperty({ example: "contact@example.com" })
    contactEmail: string;
}

// ==================== Brand Settings ====================

export class BrandSettingsDto {
    @ApiProperty({ example: "https://example.com/logo.png", description: "URL to the site logo" })
    logo: string;

    @ApiProperty({ example: "My Blog", description: "Website title" })
    title: string;

    @ApiProperty({ example: "Giới thiệu ngắn", description: "Short introduction (Vietnamese)" })
    shortIntroVi: string;

    @ApiProperty({ example: "Short intro", description: "Short introduction (English)" })
    shortIntroEn: string;

    @ApiProperty({
        example: "Nội dung giới thiệu đầy đủ...",
        description: "Full introduction (Vietnamese)",
    })
    fullIntroVi: string;

    @ApiProperty({
        example: "Full about me content...",
        description: "Full introduction (English)",
    })
    fullIntroEn: string;

    @ApiProperty({ example: "contact@example.com", description: "Contact email" })
    contactEmail: string;
}

export class BrandSettingsResponseDto {
    @ApiProperty({ example: "https://example.com/logo.png" })
    logo: string;

    @ApiProperty({ example: "My Blog" })
    title: string;

    @ApiProperty({ example: "Giới thiệu ngắn" })
    shortIntroVi: string;

    @ApiProperty({ example: "Short intro" })
    shortIntroEn: string;

    @ApiProperty({ example: "Nội dung giới thiệu đầy đủ..." })
    fullIntroVi: string;

    @ApiProperty({ example: "Full about me content..." })
    fullIntroEn: string;

    @ApiProperty({ example: "contact@example.com" })
    contactEmail: string;
}
