import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CurrentUser } from "../../common/decorators";
import { PaginatedResponseDto } from "../../common/dto";
import { FirebaseUser } from "../../common/guards/firebase-auth.guard";
import { UpdateUserDto, UserQueryDto, UserResponseDto } from "./dto";
import { UsersService } from "./users.service";

@ApiTags("Users")
@Controller("users")
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get("me")
    @ApiOperation({ summary: "Get current authenticated user" })
    @ApiResponse({ status: 200, type: UserResponseDto })
    async getCurrentUser(@CurrentUser() firebaseUser: FirebaseUser): Promise<UserResponseDto> {
        return this.usersService.getCurrentUser(firebaseUser);
    }

    @Post("sync-firebase")
    @ApiOperation({ summary: "Sync all users from Firebase to database" })
    @ApiResponse({ status: 200 })
    async syncFirebaseUsers(): Promise<{ synced: number; total: number; errors: string[] }> {
        return this.usersService.syncAllFirebaseUsers();
    }

    @Get()
    @ApiOperation({ summary: "Get all users with pagination and filtering" })
    @ApiResponse({ status: 200, type: PaginatedResponseDto })
    async findAll(@Query() query: UserQueryDto): Promise<PaginatedResponseDto<UserResponseDto>> {
        return this.usersService.findAll(query);
    }

    @Get(":id")
    @ApiOperation({ summary: "Get user by ID" })
    @ApiResponse({ status: 200, type: UserResponseDto })
    @ApiResponse({ status: 404, description: "User not found" })
    async findById(@Param("id") id: string): Promise<UserResponseDto> {
        return this.usersService.findById(id);
    }

    @Patch(":id")
    @ApiOperation({ summary: "Update user" })
    @ApiResponse({ status: 200, type: UserResponseDto })
    @ApiResponse({ status: 404, description: "User not found" })
    async update(@Param("id") id: string, @Body() dto: UpdateUserDto): Promise<UserResponseDto> {
        return this.usersService.update(id, dto);
    }
}
