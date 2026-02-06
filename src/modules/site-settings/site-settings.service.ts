import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BrandSettingsResponseDto, FooterSettingsResponseDto, SiteSettingResponseDto } from "./dto";
import { UpdateSiteSettingDto } from "./dto/update-site-setting.dto";

// Setting keys constants
export const SITE_SETTING_KEYS = {
    FOOTER_SOCIAL_LINKS: "footer_social_links",
    FOOTER_CONTACT_EMAIL: "footer_contact_email",
    BRAND_SETTINGS: "brand_settings",
} as const;

@Injectable()
export class SiteSettingsService {
    constructor(private readonly prisma: PrismaService) {}

    async findAll(): Promise<SiteSettingResponseDto[]> {
        return this.prisma.siteSetting.findMany({
            orderBy: { key: "asc" },
        });
    }

    async findByKey(key: string): Promise<SiteSettingResponseDto> {
        const setting = await this.prisma.siteSetting.findUnique({
            where: { key },
        });

        if (!setting) {
            throw new NotFoundException(`Setting with key "${key}" not found`);
        }

        return setting;
    }

    async upsert(key: string, dto: UpdateSiteSettingDto): Promise<SiteSettingResponseDto> {
        const result = await this.prisma.siteSetting.upsert({
            where: { key },
            update: { value: dto.value as object },
            create: { key, value: dto.value as object },
        });

        // Sync contactEmail if brand_settings is updated
        if (key === SITE_SETTING_KEYS.BRAND_SETTINGS) {
            const brandValue = dto.value as any;
            if (brandValue?.contactEmail) {
                await this.prisma.siteSetting.upsert({
                    where: { key: SITE_SETTING_KEYS.FOOTER_CONTACT_EMAIL },
                    update: { value: { email: brandValue.contactEmail } },
                    create: {
                        key: SITE_SETTING_KEYS.FOOTER_CONTACT_EMAIL,
                        value: { email: brandValue.contactEmail },
                    },
                });
            }
        }

        return result;
    }

    async getFooterSettings(): Promise<FooterSettingsResponseDto> {
        const [socialLinksSettings, contactEmailSettings] = await Promise.all([
            this.prisma.siteSetting.findUnique({
                where: { key: SITE_SETTING_KEYS.FOOTER_SOCIAL_LINKS },
            }),
            this.prisma.siteSetting.findUnique({
                where: { key: SITE_SETTING_KEYS.FOOTER_CONTACT_EMAIL },
            }),
        ]);

        // Default values if settings don't exist
        const socialLinks = (socialLinksSettings?.value as { links?: unknown[] })?.links || [];
        const contactEmail = (contactEmailSettings?.value as { email?: string })?.email || "";

        return {
            socialLinks: socialLinks as FooterSettingsResponseDto["socialLinks"],
            contactEmail,
        };
    }

    async getBrandSettings(): Promise<BrandSettingsResponseDto> {
        const [brandSettings, contactEmailSettings] = await Promise.all([
            this.prisma.siteSetting.findUnique({
                where: { key: SITE_SETTING_KEYS.BRAND_SETTINGS },
            }),
            this.prisma.siteSetting.findUnique({
                where: { key: SITE_SETTING_KEYS.FOOTER_CONTACT_EMAIL },
            }),
        ]);

        const value = brandSettings?.value as BrandSettingsResponseDto | undefined;
        const contactEmail = (contactEmailSettings?.value as { email?: string })?.email || "";

        return {
            logo: value?.logo || "",
            title: value?.title || "",
            shortIntroVi: value?.shortIntroVi || "",
            shortIntroEn: value?.shortIntroEn || "",
            fullIntroVi: value?.fullIntroVi || "",
            fullIntroEn: value?.fullIntroEn || "",
            contactEmail: value?.contactEmail || contactEmail,
        };
    }
}
