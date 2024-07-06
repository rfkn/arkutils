import { Injectable } from '@nestjs/common';
import { AppFileBuffer } from '../../common/types/app-file.interface';
import * as fs from 'fs';
import { AppLogger } from 'src/logger';
import { IFileStorageService } from '../application/file-storage-service.interface';

@Injectable()
export class LocalFileStorageService implements IFileStorageService {
    constructor(private readonly logger: AppLogger) {}

    async saveFileBufferToFile(file: AppFileBuffer, backupFolder: string) {
        this.logger.log(`Saving file: ${file.name}`, 'FileStorageService');

        const destinationFolder = `${backupFolder}`;
        if (!fs.existsSync(destinationFolder)) {
            fs.mkdirSync(destinationFolder, { recursive: true });
        }

        const destination = `${destinationFolder}/${file.name}`;

        // Save the file to the destination
        try {
            fs.writeFileSync(destination, file.buffer);
        } catch (error) {
            throw new Error(`Error saving file: ${error.message}`);
        }
    }

    async listDirsInFolder(folderPath: string): Promise<string[]> {
        return fs
            .readdirSync(folderPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => dirent.name);
    }

    async listFilesInFolder(folderPath: string): Promise<string[]> {
        return fs
            .readdirSync(folderPath, { withFileTypes: true })
            .filter((dirent) => dirent.isFile())
            .map((dirent) => dirent.name);
    }

    async copyFolder(source: string, destination: string): Promise<void> {
        this.logger.log(
            `Copying folder: ${source} to ${destination}`,
            'FileStorageService',
        );
        fs.mkdirSync(destination, { recursive: true });
        const dirs = fs.readdirSync(source, { withFileTypes: true });
        for (const dirent of dirs) {
            if (dirent.isDirectory()) {
                await this.copyFolder(
                    `${source}/${dirent.name}`,
                    `${destination}/${dirent.name}`,
                );
            } else {
                fs.copyFileSync(
                    `${source}/${dirent.name}`,
                    `${destination}/${dirent.name}`,
                );
            }
        }
    }

    async deleteFolder(folderPath: string): Promise<void> {
        this.logger.log(`Deleting folder: ${folderPath}`, 'FileStorageService');
        fs.rmSync(folderPath, { recursive: true });
    }

    async deleteFilesMatchingPattern(
        folderPath: string,
        pattern: RegExp,
    ): Promise<void> {
        const files = fs.readdirSync(folderPath);
        files.forEach((file) => {
            if (pattern.test(file)) {
                this.logger.log(`Deleting file: ${file}`, 'FileStorageService');
                fs.unlinkSync(`${folderPath}/${file}`);
            }
        });
    }
}
