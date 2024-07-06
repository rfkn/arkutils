import { UseCase } from '../../../common/use-case';
import { IFileStorageService } from '../../../file-storage/application/file-storage-service.interface';
import { DateStorageUtils } from '../utils/date-storage.utils';
import { AppLogger } from '../../../logger';

export interface CopyLatestBackupToFolderPayload {
    fromBackupsDir: string;
    destinationDir: string;
}

export class CopyLatestBackupToFolderUseCase
    implements UseCase<CopyLatestBackupToFolderPayload>
{
    constructor(
        private readonly fileStorageService: IFileStorageService,
        private readonly logger: AppLogger,
    ) {}

    async execute({
        fromBackupsDir,
        destinationDir,
    }: CopyLatestBackupToFolderPayload) {
        const allFolders =
            await this.fileStorageService.listDirsInFolder(fromBackupsDir);
        const folders = DateStorageUtils.getOnlyDateFolders(allFolders);

        const latestFolder = folders.reduce((latest, current) => {
            const latestDate = new Date(
                DateStorageUtils.folderDateToIsoString(latest),
            );
            const currentDate = new Date(
                DateStorageUtils.folderDateToIsoString(current),
            );
            if (latestDate > currentDate) {
                return latest;
            }
            return current;
        }, folders[0]);

        this.logger.log(
            `Copying latest backup ${latestFolder} to folder: ${destinationDir}`,
            'BackupsRotationService.copyLatestBackupToFolder',
        );

        await this.fileStorageService.copyFolder(
            `${fromBackupsDir}/${latestFolder}`,
            `${destinationDir}/${latestFolder}`,
        );

        return {
            success: true,
        };
    }
}
