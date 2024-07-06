import { Inject, Injectable } from '@nestjs/common';
import { IFtpService } from 'src/game-server/domain/interfaces/i-ftp-service.interface';
import { IGameBackupManager } from 'src/game-server/domain/interfaces/i-game-backup-manager.interface';
import { AppLogger } from 'src/logger';
import { ArkMapConfiguration } from './ark-map-configuration';
import { FileInfo } from 'basic-ftp';
import { IFileStorageService } from '../../../../file-storage/application/file-storage-service.interface';
import { DateStorageUtils } from '../../utils/date-storage.utils';

export const PROFILES_SUBFOLDER = 'profiles' as const;

@Injectable()
export class ArkAscendedBackupManager
    implements IGameBackupManager<ArkMapConfiguration>
{
    constructor(
        private readonly logger: AppLogger,
        @Inject(IFileStorageService)
        private readonly fileStorageService: IFileStorageService,
    ) {}

    async runBackup(
        ftpService: IFtpService,
        config: ArkMapConfiguration,
        backupsDestinationDir: string,
        maxRetries: number = 3,
    ): Promise<void> {
        const timestamp = DateStorageUtils.getDateAsFolderName();
        try {
            await this.tryBackup(
                ftpService,
                config,
                backupsDestinationDir,
                timestamp,
            );
        } catch (e) {
            this.logger.error(
                `Error running backup for server ${config.serverName}: ${e.message}`,
                e.stack,
                'ArkAscendedBackupManager.main',
            );
            this.logger.log(
                'retries left: ' + maxRetries,
                'ArkAscendedBackupManager.main',
            );
            await this.fileStorageService.deleteFolder(
                `${backupsDestinationDir}/${config.mapFolderName}/${timestamp}`,
            );
            if (maxRetries > 0) {
                maxRetries--;
                this.logger.log(
                    `Retrying backup for server ${config.serverName}...`,
                    'ArkAscendedBackupManager.main',
                );
                await ftpService.recover();
                await this.runBackup(
                    ftpService,
                    config,
                    backupsDestinationDir,
                    maxRetries,
                );
            } else {
                this.logger.error(
                    `Backup for server ${config.serverName} failed`,
                    'ArkAscendedBackupManager.main',
                );
            }
        }
    }

    async tryBackup(
        ftpService: IFtpService,
        config: ArkMapConfiguration,
        backupsDestinationDir: string,
        timestamp: string,
    ): Promise<void> {
        const start = Date.now();
        const { serverName, mapFolderName, mapDisplayName } = config;
        this.logger.log(
            `Starting Ark Ascended backup for server ${serverName} and map ${mapDisplayName}...`,
            'ArkAscendedBackupManager.runBackup',
        );

        await this.backupProfiles(
            ftpService,
            config,
            backupsDestinationDir,
            timestamp,
        );

        const backupsList = (
            await ftpService.listFiles(
                `${config.baseSavePath}/${mapFolderName}/`,
            )
        ).filter((file) => file.name.match('.ark.gz'));

        try {
            const mostRecentBackup =
                DateStorageUtils.getMostRecentFile(backupsList);

            this.logger.log(
                `Downloading most recent backup: ${mostRecentBackup.name}...`,
                'ArkAscendedBackupManager.runBackup',
            );

            await this.downloadFile(
                ftpService,
                config,
                mostRecentBackup,
                backupsDestinationDir,
                timestamp,
            );
            this.logger.log(
                `Most recent backup downloaded: ${mostRecentBackup.name}`,
                'ArkAscendedBackupManager.runBackup',
            );
        } catch (e) {
            this.logger.error(
                `Error downloading most recent backup file: ${e}. Continuing execution`,
                e.stack,
                'ArkAscendedBackupManager.tryBackup',
            );
        }

        this.logger.log(
            `Downloading current game state file...`,
            'ArkAscendedBackupManager.runBackup',
        );
        const gameStateFile = (
            await ftpService.listFiles(
                `${config.baseSavePath}/${mapFolderName}/`,
            )
        ).find((file) => file.name.match(`${mapFolderName}\.ark`));
        if (!gameStateFile) {
            throw new Error('Game state file not found');
        }
        await this.downloadFile(
            ftpService,
            config,
            gameStateFile,
            backupsDestinationDir,
            timestamp,
        );
        this.logger.log(
            `Game state file downloaded: ${gameStateFile.name}`,
            'ArkAscendedBackupManager.runBackup',
        );

        const end = Date.now();
        this.logger.log(
            `Completed Ark Ascended backup. Duration: ${(end - start) / 1000}s`,
            'ArkAscendedBackupManager.runBackup',
        );
    }

    private async listSavedProfiles(
        ftpService: IFtpService,
        config: ArkMapConfiguration,
        profilesPath: string,
    ): Promise<FileInfo[]> {
        const filesList = await ftpService.listFiles(profilesPath);
        const profiles = filesList.filter((file) =>
            file.name.match(config.profileExtensionRegex),
        );
        return profiles;
    }

    private async backupProfiles(
        ftpService: IFtpService,
        config: ArkMapConfiguration,
        backupsDestinationDir: string,
        timestamp: string,
    ): Promise<void> {
        const profilesPath = `${config.baseSavePath}/${config.mapFolderName}/`;

        const profileList: FileInfo[] = await this.listSavedProfiles(
            ftpService,
            config,
            profilesPath,
        );
        this.logger.log(
            `Profile file list received. Number of profile files: ${profileList.length}`,
            'ArkAscendedBackupManager.runBackup',
        );

        for (const profileFile of profileList) {
            this.logger.log(
                `Downloading profile: ${profileFile.name}`,
                'ArkAscendedBackupManager.runBackup',
            );
            const sourceFilePath = `${profilesPath}/${profileFile.name}`;
            const fileContent = await ftpService.downloadFileToBuffer(
                profileFile.name,
                sourceFilePath,
            );
            await this.fileStorageService.saveFileBufferToFile(
                fileContent,
                `${backupsDestinationDir}/${config.mapFolderName}/${PROFILES_SUBFOLDER}/${timestamp}`,
            );
        }
    }

    private async downloadFile(
        ftpService: IFtpService,
        config: ArkMapConfiguration,
        file: FileInfo,
        backupsDestinationDir: string,
        timestamp: string,
    ): Promise<void> {
        const backupsPath = `${config.baseSavePath}/${config.mapFolderName}/`;
        const sourceFilePath = `${backupsPath}/${file.name}`;
        const fileContent = await ftpService.downloadFileToBuffer(
            file.name,
            sourceFilePath,
        );
        await this.fileStorageService.saveFileBufferToFile(
            fileContent,
            `${backupsDestinationDir}/${config.mapFolderName}/${timestamp}`,
        );
    }
}
