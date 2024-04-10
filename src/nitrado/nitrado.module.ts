import { Module } from "@nestjs/common";
import { AppLogger } from "src/logger";
import { NitradoFtpService } from "./services/nitrado-ftp.service";

@Module({
    imports: [],
    controllers: [],
    providers: [AppLogger, NitradoFtpService],
    exports: [NitradoFtpService],
})
export class NitradoModule {}
