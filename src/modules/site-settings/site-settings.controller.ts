import { Body, Controller, Get, Param, Put } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SiteSettingResponseDto, UpdateSiteSettingDto } from "./dto";
import { SiteSettingsService } from "./site-settings.service";

@ApiTags("Site Settings")
@Controller("site-settings")
export class SiteSettingsController {
    constructor(private readonly siteSettingsService: SiteSettingsService) {}

    @Get()
    @ApiOperation({ summary: "Get all site settings (Admin only)" })
    @ApiResponse({ status: 200, type: [SiteSettingResponseDto] })
    async findAll(): Promise<SiteSettingResponseDto[]> {
        return this.siteSettingsService.findAll();
    }

    @Get(":key")
    @ApiOperation({ summary: "Get a site setting by key (Admin only)" })
    @ApiParam({ name: "key", description: "Setting key" })
    @ApiResponse({ status: 200, type: SiteSettingResponseDto })
    @ApiResponse({ status: 404, description: "Setting not found" })
    async findByKey(@Param("key") key: string): Promise<SiteSettingResponseDto> {
        return this.siteSettingsService.findByKey(key);
    }

    @Put(":key")
    @ApiOperation({ summary: "Update or create a site setting (Admin only)" })
    @ApiParam({ name: "key", description: "Setting key" })
    @ApiResponse({ status: 200, type: SiteSettingResponseDto })
    async upsert(
        @Param("key") key: string,
        @Body() dto: UpdateSiteSettingDto
    ): Promise<SiteSettingResponseDto> {
        return this.siteSettingsService.upsert(key, dto);
    }
}
