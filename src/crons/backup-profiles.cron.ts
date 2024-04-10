import { Injectable, LoggerService, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ftp from 'basic-ftp';
import { FileStorageService } from 'src/file-storage/file-storage.service';
import { AppLogger } from 'src/logger';
import { ArkMap, SAVE_PATH } from 'src/nitrado/common/constants';
import { NitradoFtpService } from 'src/nitrado/services/nitrado-ftp.service';

@Injectable()
export class BackupProfilesCron {
    constructor(
        private readonly fileStorageService: FileStorageService,
        private readonly nitradoFtpService: NitradoFtpService,
        private readonly logger: AppLogger,
    ) {}

    async backupProfiles() {
        try {
            const client = await this.nitradoFtpService.connect();
            this.logger.log('Backup profiles cron started', 'BackupProfilesCron');

            const profileList = await this.nitradoFtpService.getProfileFilesList(ArkMap.TheIsland, client);
            this.logger.log('Profile list received. Number of profiles: ' + profileList.length, 'BackupProfilesCron');

            for (const profileFile of profileList) {
                this.logger.log('Downloading profile: ' + profileFile.name, 'BackupProfilesCron');
                const path = profileFile.name;
                const fileContent = await this.nitradoFtpService.downloadFileToBuffer(path, profileFile.name, client);
                await this.fileStorageService.saveArkBackupFile(fileContent, ArkMap.TheIsland);
            }

            this.logger.log('Backup profiles cron finished', 'BackupProfilesCron');
        } catch (error) {
            this.logger.error('Error in backup profiles cron: ' + error.message, 'BackupProfilesCron');
        }
    }
}
