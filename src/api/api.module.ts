import { Module } from "@nestjs/common";
import { ApiController } from "./api.controller";
import { NitradoModule } from "src/nitrado/nitrado.module";
import { CronsModule } from "src/crons/crons.module";

@Module({
    imports: [NitradoModule, CronsModule],
    controllers: [ApiController],
    providers: [],
    exports: [],
})
export class ApiModule {}
