import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { FirebaseModule } from "./common/firebase";
import { AdminGuard, FirebaseAuthGuard } from "./common/guards";
import { validationSchema } from "./config";
import configuration from "./config/configuration";
import { CategoriesModule } from "./modules/categories/categories.module";
import { PostsModule } from "./modules/posts/posts.module";
import { TagsModule } from "./modules/tags/tags.module";
import { UsersModule } from "./modules/users/users.module";
import { PrismaModule } from "./prisma/prisma.module";

@Module({
    imports: [
        // Global configuration
        ConfigModule.forRoot({
            isGlobal: true,
            load: [configuration],
            envFilePath: [".env.local", ".env"],
            validationSchema,
        }),
        FirebaseModule,
        PrismaModule,
        UsersModule,
        CategoriesModule,
        PostsModule,
        TagsModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        // Register FirebaseAuthGuard globally (checks Firebase token)
        {
            provide: APP_GUARD,
            useClass: FirebaseAuthGuard,
        },
        // Register AdminGuard globally (checks admin role)
        {
            provide: APP_GUARD,
            useClass: AdminGuard,
        },
    ],
})
export class AppModule {}
