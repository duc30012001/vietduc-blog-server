import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class UpdateSiteSettingDto {
    @ApiProperty({ description: "JSON value for the setting" })
    @IsNotEmpty()
    value: unknown;
}
