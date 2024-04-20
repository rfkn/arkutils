import { Injectable } from "@nestjs/common";
import { AppFileBuffer } from "../common/types/app-file.interface";
import * as fs from "fs";
import { AppLogger } from "src/logger";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class FileStorageService {
    constructor(
        private readonly logger: AppLogger,
        private readonly configService: ConfigService,
    ) {}

    async saveFileBufferToFile(file: AppFileBuffer, backupFolder: string) {
        this.logger.log(`Saving file: ${file.name}`, 'FileStorageService')

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
}
