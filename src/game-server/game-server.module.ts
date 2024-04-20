import { Module } from "@nestjs/common";
import { AppLogger } from "src/logger";
import { FtpClient } from "./infrastructure/ftp/ftp-client";
import { FileStorageModule } from "src/file-storage/file-storage.module";
import GameServerUseCases from "./application/use-cases";
import { RunArkBackupUseCase } from "./application/use-cases/run-ark-backup.use-case";
import { ArkAscendedBackupManager } from "./application/services/backup-managers/ark-backup-manager";

@Module({
    imports: [FileStorageModule],
    controllers: [],
    providers: [AppLogger, ArkAscendedBackupManager, ...GameServerUseCases],
    exports: [RunArkBackupUseCase],
})
export class GameServerModule {}
