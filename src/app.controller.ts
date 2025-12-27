import { Controller, Get } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { AppService } from "./app.service";
import { Public } from "./common";

@Public()
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    @ApiOperation({ summary: "Thông tin API" })
    @ApiResponse({
        status: 200,
        description: "Thông tin cơ bản về API server",
        schema: {
            type: "object",
            properties: {
                name: { type: "string", example: "Duck Blog Server" },
                version: { type: "string", example: "1.0" },
                docs: { type: "string", example: "/api-docs" },
            },
        },
    })
    getHello() {
        return this.appService.getHello();
    }
}
