import { Module } from '@nestjs/common';
import { AppLogger } from 'src/logger';
import { FileStorageModule } from 'src/file-storage/file-storage.module';
import { ArkBackupCron } from './infrastructure/crons/ark/ark-backup.cron';
import { RotateArkBackupsCron } from './infrastructure/crons/ark/rotate-ark-backups.cron';
import GameServerUseCases from './application/use-cases';
import { BackupManagers } from './application/backup-managers/game-backup-manager.factory';
import { HttpApiController } from './infrastructure/http-api/http-api.controller';

@Module({
    imports: [FileStorageModule],
    controllers: [HttpApiController],
    providers: [
        AppLogger,

        // Application
        ...GameServerUseCases,
        ...BackupManagers,

        // Infrastructure
        ArkBackupCron,
        RotateArkBackupsCron,
    ],
    exports: [...GameServerUseCases],
})
export class GameServerModule {}
