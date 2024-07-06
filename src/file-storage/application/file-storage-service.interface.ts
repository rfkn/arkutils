import { AppFileBuffer } from '../../common/types/app-file.interface';

export const IFileStorageService = Symbol('IFileStorageService');

export interface IFileStorageService {
    saveFileBufferToFile(
        file: AppFileBuffer,
        backupFolder: string,
    ): Promise<void>;

    listDirsInFolder(folderPath: string): Promise<string[]>;

    listFilesInFolder(folderPath: string): Promise<string[]>;

    copyFolder(source: string, destination: string): Promise<void>;

    deleteFolder(folderPath: string): Promise<void>;

    deleteFilesMatchingPattern(
        folderPath: string,
        pattern: RegExp,
    ): Promise<void>;
}
