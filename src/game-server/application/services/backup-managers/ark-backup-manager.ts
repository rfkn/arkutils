import { Injectable } from "@nestjs/common";
import { FileStorageService } from "src/file-storage/file-storage.service";
import { IFtpService } from "src/game-server/domain/interfaces/i-ftp-service.interface";
import { IGameBackupManager } from "src/game-server/domain/interfaces/i-game-backup-manager.interface";
import { AppLogger } from "src/logger";
import { ArkMapConfiguration } from "../../interfaces/ark-game-configuration.interface";
import { FileInfo } from "basic-ftp";

@Injectable()
export class ArkAscendedBackupManager implements IGameBackupManager<ArkMapConfiguration> {
    constructor(
        private readonly logger: AppLogger,
        private readonly fileStorageService: FileStorageService,
    ) {}

    async runBackup(
        ftpService: IFtpService,
        config: ArkMapConfiguration,
        backupsDestinationDir: string,
    ): Promise<void> {
        const timestamp = new Date().toISOString();
        const start = Date.now();
        const {
            serverName,
            mapFolderName,
            mapDisplayName,
        } = config;
        this.logger.log(`Starting Ark Ascended backup for server ${
            serverName
        } and map ${mapDisplayName}...`,
            'ArkAscendedBackupManager.runBackup'
        );

        await this.backupProfiles(
            ftpService,
            config,
            backupsDestinationDir,
            timestamp
        );

        const backupsList = (await ftpService.listFiles(
            `${config.baseSavePath}/${mapFolderName}/`
        )).filter(file => file.name.match('.ark\.gz'));

        const mostRecentBackup = this.getMostRecentFile(backupsList);

        this.logger.log(
            `Downloading most recent backup: ${
                mostRecentBackup.name
            }...`,
            'ArkAscendedBackupManager.runBackup'
        );
        await this.downloadFile(
            ftpService,
            config,
            mostRecentBackup,
            backupsDestinationDir,
            timestamp
        );
        this.logger.log(
            `Most recent backup downloaded: ${
                mostRecentBackup.name
            }`,
            'ArkAscendedBackupManager.runBackup'
        );

        this.logger.log(
            `Downloading current game state file...`,
            'ArkAscendedBackupManager.runBackup'
        )
        const gameStateFile = (await ftpService.listFiles(
            `${config.baseSavePath}/${mapFolderName}/`
        )).find(file => file.name.match(`${mapFolderName}\.ark`));
        if (!gameStateFile) {
            throw new Error('Game state file not found');
        }
        await this.downloadFile(
            ftpService,
            config,
            gameStateFile,
            backupsDestinationDir,
            timestamp
        );
        this.logger.log(
            `Game state file downloaded: ${
                gameStateFile.name
            }`,
            'ArkAscendedBackupManager.runBackup'
        );

        const end = Date.now();
        this.logger.log(`Completed Ark Ascended backup. Duration: ${
            (end - start) / 1000
        }s`, 'ArkAscendedBackupManager.runBackup');
    }

    private async listSavedProfiles(
        ftpService: IFtpService,
        config: ArkMapConfiguration,
        profilesPath: string
    ): Promise<FileInfo[]> {
        const filesList = await ftpService.listFiles(profilesPath);
        const profiles = filesList.filter(file => file.name.match(config.profileExtensionRegex));
        return profiles;
    }

    private async backupProfiles(
        ftpService: IFtpService,
        config: ArkMapConfiguration,
        backupsDestinationDir: string,
        timestamp: string
    ): Promise<void> {
        const profilesPath = `${config.baseSavePath}/${config.mapFolderName}/`;

        const profileList: FileInfo[] = await this.listSavedProfiles(
            ftpService,
            config,
            profilesPath
        );
        this.logger.log(`Profile file list received. Number of profile files: ${profileList.length}`, 'ArkAscendedBackupManager.runBackup');

        for (const profileFile of profileList) {
            this.logger.log(`Downloading profile: ${
                profileFile.name
            }`, 'ArkAscendedBackupManager.runBackup');
            const sourceFilePath = `${profilesPath}/${profileFile.name}`;
            const fileContent = await ftpService.downloadFileToBuffer(
                profileFile.name,
                sourceFilePath
            );
            await this.fileStorageService.saveFileBufferToFile(
                fileContent,
                `${backupsDestinationDir}/${config.mapFolderName}/profiles/${timestamp}`
            );
        }
    }

    private async downloadFile(
        ftpService: IFtpService,
        config: ArkMapConfiguration,
        file: FileInfo,
        backupsDestinationDir: string,
        timestamp: string
    ): Promise<void> {
        const backupsPath = `${config.baseSavePath}/${config.mapFolderName}/`;
        const sourceFilePath = `${backupsPath}/${file.name}`;
        const fileContent = await ftpService.downloadFileToBuffer(
            file.name,
            sourceFilePath
        );
        await this.fileStorageService.saveFileBufferToFile(
            fileContent,
            `${backupsDestinationDir}/${config.mapFolderName}/${timestamp}`,
        );
    }

    private parseDateFromFile(file: FileInfo): Date {
        const datePattern = /\d{2}\.\d{2}\.\d{4}_\d{2}\.\d{2}\.\d{2}/;
        const dateMatch = file.name.match(datePattern);
        if (!dateMatch) {
            throw new Error(`Invalid filename: ${file.name}`);
        }
        const [day, month, year, hours, minutes, seconds] = dateMatch[0].split(/[._]/).map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
    }

    private getMostRecentFile(files: FileInfo[]): FileInfo {
        const mostRecentFile = files.reduce((mostRecent, file) => {
            const fileDate = this.parseDateFromFile(file);
            if (!mostRecent || fileDate > this.parseDateFromFile(mostRecent)) {
                return file;
            } else {
                return mostRecent;
            }
        }, null as FileInfo | null);

        if (!mostRecentFile) {
            const fileNames = files.map(file => file.name);
            this.logger.error(
                `No most recent backup file found in file list: ${JSON.stringify(fileNames, null, 2)}`,
                'ArkAscendedBackupManager.getMostRecentFile'
            );
            throw new Error('No most recent backup file found');
        }

        return mostRecentFile;
    }
}
