import { Inject, Injectable } from '@nestjs/common';
import { AppLogger } from '../../../logger';
import { IFileStorageService } from '../../../file-storage/application/file-storage-service.interface';
import { UseCase, UseCaseSuccessResult } from '../../../common/use-case';
import { DateStorageUtils } from '../utils/date-storage.utils';

export interface DeleteOlderBackupsPayload {
    hours: number;
    backupsDir: string;
    filePattern?: RegExp;
}

@Injectable()
export class DeleteOlderBackupsUseCase
    implements UseCase<DeleteOlderBackupsPayload>
{
    constructor(
        private readonly logger: AppLogger,
        @Inject(IFileStorageService)
        private readonly fileStorageService: IFileStorageService,
    ) {}

    /**
     * Deletes backups older than the specified number of hours.
     *
     * @param payload - Payload
     * @param {number} payload.hours - The number of hours to keep backups for.
     * @param {string} payload.backupsDir - The directory where the backups are stored.
     * @param {string} [payload.filePattern] - The pattern to match files to delete in the timestamped folders. If not provided, the whole folder will be deleted.
     * */
    async execute({
        hours,
        backupsDir,
        filePattern,
    }: DeleteOlderBackupsPayload): Promise<UseCaseSuccessResult<void>> {
        const allFolders =
            await this.fileStorageService.listDirsInFolder(backupsDir);
        const folders = DateStorageUtils.getOnlyDateFolders(allFolders);

        // folder name format: 2024-04-21_03.02.11.921Z

        const now = new Date();
        const cutoff = new Date(now.getTime() - hours * 60 * 60 * 1000);

        for (const folder of folders) {
            const folderDate = new Date(
                DateStorageUtils.folderDateToIsoString(folder),
            );
            if (folderDate < cutoff) {
                if (filePattern) {
                    this.logger.log(
                        `Deleting files in folder: ${folder} matching pattern: ${filePattern}`,
                        'BackupsRotationService.deleteBackupsOlderThan',
                    );
                    await this.fileStorageService.deleteFilesMatchingPattern(
                        `${backupsDir}/${folder}`,
                        filePattern,
                    );
                } else {
                    this.logger.log(
                        `Deleting folder: ${folder}`,
                        'BackupsRotationService.deleteBackupsOlderThan',
                    );
                    await this.fileStorageService.deleteFolder(
                        `${backupsDir}/${folder}`,
                    );
                }
            }
        }

        return {
            success: true,
        };
    }
}
