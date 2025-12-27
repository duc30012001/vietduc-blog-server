import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import * as admin from "firebase-admin";
import * as fs from "fs";
import * as path from "path";

export interface FirebaseUserRecord {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    emailVerified?: boolean;
}

@Injectable()
export class FirebaseService implements OnModuleInit {
    private readonly logger = new Logger(FirebaseService.name);
    private app: admin.app.App;

    onModuleInit() {
        const serviceAccountPath = path.join(process.cwd(), "firebase-adminsdk.json");

        if (!fs.existsSync(serviceAccountPath)) {
            this.logger.warn(
                "Firebase service account file not found (firebase-adminsdk.json). Firebase authentication will not work."
            );
            return;
        }

        const serviceAccount = JSON.parse(
            fs.readFileSync(serviceAccountPath, "utf-8")
        ) as admin.ServiceAccount;

        this.app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });

        this.logger.log("Firebase Admin SDK initialized successfully");
    }

    getAuth(): admin.auth.Auth {
        return this.app?.auth();
    }

    async verifyIdToken(idToken: string): Promise<admin.auth.DecodedIdToken | null> {
        try {
            return await this.getAuth().verifyIdToken(idToken);
        } catch {
            return null;
        }
    }

    /**
     * List all users from Firebase Authentication
     * Iterates through all users using pagination
     */
    async listAllUsers(): Promise<FirebaseUserRecord[]> {
        const users: FirebaseUserRecord[] = [];
        let nextPageToken: string | undefined;

        do {
            const listResult = await this.getAuth().listUsers(1000, nextPageToken);

            for (const userRecord of listResult.users) {
                users.push({
                    uid: userRecord.uid,
                    email: userRecord.email,
                    displayName: userRecord.displayName,
                    photoURL: userRecord.photoURL,
                    emailVerified: userRecord.emailVerified,
                });
            }

            nextPageToken = listResult.pageToken;
        } while (nextPageToken);

        return users;
    }
}
