import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength } from "class-validator";

export class CreateTagDto {
    @ApiProperty({ description: "Tên tiếng Việt", maxLength: 100 })
    @IsString()
    @MaxLength(100)
    name_vi: string;

    @ApiProperty({ description: "Tên tiếng Anh", maxLength: 100 })
    @IsString()
    @MaxLength(100)
    name_en: string;
}
