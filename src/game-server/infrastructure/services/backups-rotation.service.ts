import { Injectable } from "@nestjs/common";
import { FileStorageService } from "src/file-storage/file-storage.service";
import { AppLogger } from "src/logger";

@Injectable()
export class BackupsRotationService {
    constructor(
        private readonly logger: AppLogger,
        private readonly fileStorageService: FileStorageService,
    ) {}

    /**
     * Deletes backups older than the specified number of hours
     * @param hours The number of hours to keep backups for
     * @param backupsDir The directory where the backups are stored
     * @param filePattern The pattern to match files to delete in the timestamped folders. If not provided, the whole folder will be deleted
     */
    async deleteBackupsOlderThan(
        hours: number,
        backupsDir: string,
        filePattern?: RegExp,
    ) {
        const allFolders = await this.fileStorageService.listDirsInFolder(backupsDir);
        const folders = this.getOnlyDateFolders(allFolders);

        // folder name format: 2024-04-21_03.02.11.921Z

        const now = new Date();
        const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);

        for (const folder of folders) {
            const folderDate = new Date(this.folderDateToIsoString(folder));
            if (folderDate < cutoff) {
                if (filePattern) {
                    this.logger.log(
                        `Deleting files in folder: ${folder} matching pattern: ${
                            filePattern
                        }`,
                        'BackupsRotationService.deleteBackupsOlderThan'
                    );
                    await this.fileStorageService.deleteFilesMatchingPattern(
                        `${backupsDir}/${folder}`,
                        filePattern,
                    );
                } else {
                    this.logger.log(
                        `Deleting folder: ${folder}`,
                        'BackupsRotationService.deleteBackupsOlderThan'
                    );
                    await this.fileStorageService.deleteFolder(`${backupsDir}/${folder}`);
                }
            }
        }
    }

    async copyLatestBackupToFolder(
        fromBackupsDir: string,
        destinationDir: string,
    ) {
        const allFolders = await this.fileStorageService.listDirsInFolder(fromBackupsDir);
        const folders = this.getOnlyDateFolders(allFolders);

        const latestFolder = folders.reduce((latest, current) => {
            const latestDate = new Date(this.folderDateToIsoString(latest));
            const currentDate = new Date(this.folderDateToIsoString(current));
            if (latestDate > currentDate) {
                return latest;
            }
            return current;
        }, folders[0]);

        this.logger.log(`Copying latest backup ${latestFolder} to folder: ${destinationDir}`, 'BackupsRotationService.copyLatestBackupToFolder');

        await this.fileStorageService.copyFolder(
            `${fromBackupsDir}/${latestFolder}`,
            `${destinationDir}/${latestFolder}`,
        );
    }

    private folderDateToIsoString(folder: string): string {
        // folder name format: 2024-04-21_03.02.11.921Z
        const folderDate = folder.replace('_', 'T').replace('.', ':').replace('.', ':');
        return folderDate;
    }

    private getOnlyDateFolders(folders: string[]): string[] {
        // folder name format: 2024-04-21_03.02.11.921Z
        const dateFolderRegex = /^\d{4}-\d{2}-\d{2}_\d{2}\.\d{2}\.\d{2}\.\d{3}Z$/;
        const dateFolders = folders.filter(folder => dateFolderRegex.test(folder));
        return dateFolders;
    }
}
