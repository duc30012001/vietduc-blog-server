import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
    getHello() {
        return {
            name: "Duck Blog Server",
            version: "1.0",
            docs: "/api-docs",
        };
    }
}
