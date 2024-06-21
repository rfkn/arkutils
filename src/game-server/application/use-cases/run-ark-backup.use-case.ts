import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from 'src/logger';
import { ArkAscendedBackupManager } from '../services/backup-managers/ark-backup-manager';
import {
    arkGameConfigs,
    arkGameServerConfigs,
} from 'src/game-server/infrastructure/configurations/ark';
import { GameServer } from 'src/game-server/domain/entities/game-server';
import { ArkMapConfiguration } from '../interfaces/ark-game-configuration.interface';
import { FtpClient } from 'src/game-server/infrastructure/ftp/ftp-client';

@Injectable()
export class RunArkBackupUseCase {
    constructor(
        private readonly configService: ConfigService,
        private readonly arkBackupManager: ArkAscendedBackupManager,
        private readonly logger: AppLogger,
    ) {}

    async execute(): Promise<void> {
        // Check if the backup folder exists
        const basePath = this.configService.get('LOCAL_BACKUPS_PATH');
        if (!basePath) {
            throw new Error('LOCAL_BACKUPS_PATH is not defined');
        }

        for (const config of arkGameConfigs) {
            const ftpClient = new FtpClient(this.logger);
            try {
                const serverConfig = {
                    ...arkGameServerConfigs[config.serverName],
                };
                serverConfig.backupsDestinationDirectory =
                    basePath + '/' + serverConfig.backupsDestinationDirectory;
                const gameServer = new GameServer<ArkMapConfiguration>(
                    ftpClient,
                    serverConfig,
                );
                await gameServer.runBackup(this.arkBackupManager);
            } catch (e) {
                this.logger.error(
                    `Error running backup for server ${config.serverName}: ${e.message}`,
                    e.stack,
                    'RunArkBackupUseCase',
                );
            }
        }
    }
}
