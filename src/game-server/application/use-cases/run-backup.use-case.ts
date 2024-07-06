import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from 'src/logger';
import { GameServer } from 'src/game-server/domain/entities/game-server';
import { Env } from '../../../env/env.enum';
import { IFtpService } from '../../domain/interfaces/i-ftp-service.interface';
import {
    GameConfigurationType,
    ServerMap,
} from '../types/game-configurations.type';
import { GameBackupManagerFactory } from '../backup-managers/game-backup-manager.factory';

export interface RunArkBackupProps {
    gameConfigs: GameConfigurationType[];
    serverMap: ServerMap;
    ftpService: IFtpService;
}

@Injectable()
export class RunBackupUseCase {
    constructor(
        private readonly gameBackupManagerFactory: GameBackupManagerFactory,
        private readonly configService: ConfigService,
        private readonly logger: AppLogger,
    ) {}

    async execute({
        gameConfigs,
        serverMap,
        ftpService,
    }: RunArkBackupProps): Promise<void> {
        const basePath = this.configService.getOrThrow<string>(
            Env.LOCAL_BACKUPS_PATH,
        );

        for (const config of gameConfigs) {
            try {
                if (!serverMap[config.serverName]) {
                    throw new Error(
                        `Missing game server configuration for ${config.serverName}`,
                    );
                }
                const serverConfig = {
                    ...serverMap[config.serverName],
                };
                if (serverConfig.gameName !== config.gameName) {
                    throw new Error(
                        `Game name for server config and game config must be the same. Server config: ${serverConfig.gameName} | Game config: ${config.gameName}`,
                    );
                }

                serverConfig.backupsDestinationDirectory =
                    basePath + '/' + serverConfig.backupsDestinationDirectory;

                const backupManager =
                    await this.gameBackupManagerFactory.create<typeof config>(
                        config,
                    );
                const gameServer = new GameServer<typeof config>(
                    ftpService,
                    serverConfig,
                );
                await gameServer.runBackup(backupManager);
            } catch (e) {
                this.logger.error(
                    `Error running backup for server ${config.serverName}: ${e.message}`,
                    e.stack,
                    'RunBackupUseCase',
                );
                throw e;
            }
        }
    }
}
