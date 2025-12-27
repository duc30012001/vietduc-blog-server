import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { FirebaseModule } from "./common/firebase";
import { FirebaseAuthGuard } from "./common/guards";
import { validationSchema } from "./config";
import configuration from "./config/configuration";
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
    ],
    controllers: [AppController],
    providers: [
        AppService,
        // Register FirebaseAuthGuard globally
        {
            provide: APP_GUARD,
            useClass: FirebaseAuthGuard,
        },
    ],
})
export class AppModule {}
