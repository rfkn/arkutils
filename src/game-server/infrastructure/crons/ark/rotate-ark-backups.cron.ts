import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/logger';
import { Cron } from '@nestjs/schedule';
import { arkGameConfigs, arkGameServerConfigs } from '../../game-configs/ark';
import { PROFILES_SUBFOLDER } from '../../../application/backup-managers/ark/ark-backup-manager';
import { ConfigService } from '@nestjs/config';
import { Env } from '../../../../env/env.enum';
import { CopyLatestBackupToFolderUseCase } from '../../../application/use-cases/copy-latest-backup-to-folder.use-case';
import { DeleteOlderBackupsUseCase } from '../../../application/use-cases/delete-older-backups.use-case';

export const STORED_BACKUPS_PATH = 'stored-backups';

@Injectable()
export class RotateArkBackupsCron {
    constructor(
        private readonly logger: AppLogger,
        private readonly configService: ConfigService,
        private readonly copyLatestBackupToFolderUseCase: CopyLatestBackupToFolderUseCase,
        private readonly deleteOlderBackupsUseCase: DeleteOlderBackupsUseCase,
    ) {}

    @Cron('5 0-23/2 * * *') // Every 2 hours at 5 minutes
    async handleCron() {
        this.logger.log('Running RotateArkBackupsCron', 'RotateArkBackupsCron');
        await this.storeCurrentBackup();
        await this.deleteOlderBackups(12);
        await this.deleteOlderBackups(48, STORED_BACKUPS_PATH);
        await this.deleteOlderBackups(72, PROFILES_SUBFOLDER);
        this.logger.log(
            'Finished running RotateArkBackupsCron',
            'RotateArkBackupsCron',
        );
    }

    async storeCurrentBackup() {
        this.logger.log('Running storeCurrentBackup', 'RotateArkBackupsCron');
        for (const config of arkGameConfigs) {
            const basePath = this.configService.get(Env.LOCAL_BACKUPS_PATH);
            const serverConfig = arkGameServerConfigs[config.serverName];
            const backupsDir =
                basePath +
                '/' +
                serverConfig.backupsDestinationDirectory +
                '/' +
                config.mapFolderName;
            try {
                this.logger.log(
                    `Storing current backup for server ${config.serverName}...`,
                    'RotateArkBackupsCron',
                );
                await this.copyLatestBackupToFolderUseCase.execute({
                    fromBackupsDir: backupsDir,
                    destinationDir: backupsDir + '/' + STORED_BACKUPS_PATH,
                });
                this.logger.log(
                    `Finished storing current backup for server ${config.serverName}`,
                    'RotateArkBackupsCron',
                );
            } catch (e) {
                this.logger.error(
                    `Error storing current backup for server ${config.serverName}: ${e.message}`,
                    e.stack,
                    'RotateArkBackupsCron',
                );
            }
        }
        this.logger.log(
            'Finished running StoreCurrentBackupCron',
            'StoreCurrentBackupCron',
        );
    }

    async deleteOlderBackups(olderThanHours: number, subPath?: string) {
        this.logger.log('Running deleteOlderBackups', 'RotateArkBackupsCron');
        for (const config of arkGameConfigs) {
            const basePath = this.configService.get(Env.LOCAL_BACKUPS_PATH);
            const serverConfig = arkGameServerConfigs[config.serverName];
            const backupsDir =
                basePath +
                '/' +
                serverConfig.backupsDestinationDirectory +
                '/' +
                config.mapFolderName +
                (subPath ? '/' + subPath : '');

            try {
                this.logger.log(
                    `Deleting older backups for server ${config.serverName}...`,
                    'RotateArkBackupsCron',
                );
                await this.deleteOlderBackupsUseCase.execute({
                    hours: olderThanHours,
                    backupsDir: backupsDir,
                });
                this.logger.log(
                    `Finished deleting older backups for server ${config.serverName}`,
                    'RotateArkBackupsCron',
                );
            } catch (e) {
                this.logger.error(
                    `Error deleting older backups for server ${config.serverName}: ${e.message}`,
                    e.stack,
                    'RotateArkBackupsCron',
                );
            }
        }
    }
}
