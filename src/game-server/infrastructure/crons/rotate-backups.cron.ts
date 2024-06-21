import { Injectable } from '@nestjs/common';
import { BackupsRotationService } from '../services/backups-rotation.service';
import { AppLogger } from 'src/logger';
import { Cron } from '@nestjs/schedule';
import { arkGameConfigs, arkGameServerConfigs } from '../configurations/ark';
import { ConfigService } from '@nestjs/config';

export const STORED_BACKUPS_PATH = 'stored-backups';

@Injectable()
export class RotateBackupsCron {
    constructor(
        private readonly logger: AppLogger,
        private readonly configService: ConfigService,
        private readonly backupsRotationService: BackupsRotationService,
    ) {}

    @Cron('5 0-23/2 * * *') // Every 2 hours at 5 minutes
    async handleCron() {
        this.logger.log('Running RotateBackupsCron', 'RotateBackupsCron');
        await this.storeCurrentBackup();
        await this.deleteOlderBackups(12);
        await this.deleteOlderBackups(48, STORED_BACKUPS_PATH);
        this.logger.log(
            'Finished running RotateBackupsCron',
            'RotateBackupsCron',
        );
    }

    async storeCurrentBackup() {
        this.logger.log('Running storeCurrentBackup', 'RotateBackupsCron');
        for (const config of arkGameConfigs) {
            const basePath = this.configService.get('LOCAL_BACKUPS_PATH');
            const serverConfig = arkGameServerConfigs[config.serverName];
            const backupsDir =
                basePath +
                '/' +
                serverConfig.backupsDestinationDirectory +
                '/' +
                config.mapFolderName;
            this.logger.log(`backupsDir: ${backupsDir}`, 'RotateBackupsCron');
            try {
                this.logger.log(
                    `Storing current backup for server ${config.serverName}...`,
                    'RotateBackupsCron',
                );
                await this.backupsRotationService.copyLatestBackupToFolder(
                    backupsDir,
                    backupsDir + '/' + STORED_BACKUPS_PATH,
                );
                this.logger.log(
                    `Finished storing current backup for server ${config.serverName}`,
                    'RotateBackupsCron',
                );
            } catch (e) {
                this.logger.error(
                    `Error storing current backup for server ${config.serverName}: ${e.message}`,
                    e.stack,
                    'RotateBackupsCron',
                );
            }
        }
        this.logger.log(
            'Finished running StoreCurrentBackupCron',
            'StoreCurrentBackupCron',
        );
    }

    async deleteOlderBackups(olderThanHours: number, subPath?: string) {
        this.logger.log('Running deleteOlderBackups', 'RotateBackupsCron');
        for (const config of arkGameConfigs) {
            const basePath = this.configService.get('LOCAL_BACKUPS_PATH');
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
                    'RotateBackupsCron',
                );
                await this.backupsRotationService.deleteBackupsOlderThan(
                    olderThanHours,
                    backupsDir,
                );
                this.logger.log(
                    `Finished deleting older backups for server ${config.serverName}`,
                    'RotateBackupsCron',
                );
            } catch (e) {
                this.logger.error(
                    `Error deleting older backups for server ${config.serverName}: ${e.message}`,
                    e.stack,
                    'RotateBackupsCron',
                );
            }
        }
    }
}
