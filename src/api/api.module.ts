import { Module } from "@nestjs/common";
import { ApiController } from "./api.controller";
import { GameServerModule } from "src/game-server/game-server.module";

@Module({
    imports: [GameServerModule],
    controllers: [ApiController],
    providers: [],
    exports: [],
})
export class ApiModule {}
