import { Injectable } from "@nestjs/common";
import { AppFileBuffer } from "./common/types/app-file.interface";
import * as fs from "fs";
import { AppLogger } from "src/logger";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FileStorageService {
    constructor(
        private readonly logger: AppLogger,
        private readonly configService: ConfigService,
    ) {}

    async saveArkBackupFile(file: AppFileBuffer, backupFolder: string) {
        this.logger.log(`Saving file: ${file.name}`, 'FileStorageService')

        // Check if the backup folder exists
        const basePath = this.configService.get('ARK_BACKUPS_PATH');
        if (!basePath) {
            throw new Error('ARK_BACKUPS_PATH is not defined');
        }
        const destinationFolder = `${basePath}/${backupFolder}`;
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
}
