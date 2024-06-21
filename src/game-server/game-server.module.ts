import { Module } from '@nestjs/common';
import { AppLogger } from 'src/logger';
import { FileStorageModule } from 'src/file-storage/file-storage.module';
import GameServerUseCases from './application/use-cases';
import { RunArkBackupUseCase } from './application/use-cases/run-ark-backup.use-case';
import { ArkAscendedBackupManager } from './application/services/backup-managers/ark-backup-manager';
import { BackupCron } from './infrastructure/crons/backup.cron';
import { RotateBackupsCron } from './infrastructure/crons/rotate-backups.cron';
import { BackupsRotationService } from './infrastructure/services/backups-rotation.service';

@Module({
    imports: [FileStorageModule],
    controllers: [],
    providers: [
        AppLogger,

        // Application
        ArkAscendedBackupManager,
        ...GameServerUseCases,

        // Infrastructure
        BackupCron,
        RotateBackupsCron,
        BackupsRotationService,
    ],
    exports: [RunArkBackupUseCase],
})
export class GameServerModule {}
