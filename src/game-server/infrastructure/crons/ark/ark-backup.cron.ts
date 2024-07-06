import { Injectable } from '@nestjs/common';
import { AppLogger } from 'src/logger';
import { Cron } from '@nestjs/schedule';
import { RunBackupUseCase } from 'src/game-server/application/use-cases/run-backup.use-case';
import { arkGameConfigs, arkGameServerConfigs } from '../../game-configs/ark';
import { FtpClient } from '../../ftp-client';

@Injectable()
export class ArkBackupCron {
    constructor(
        private readonly logger: AppLogger,
        private readonly runBackupsUseCase: RunBackupUseCase,
    ) {}

    @Cron('2-59/15 * * * *') // every 15 minutes offset by 2 minutes
    async handleCron() {
        this.logger.log('Running BackupCron', 'BackupCron');
        try {
            await this.runBackupsUseCase.execute({
                gameConfigs: arkGameConfigs,
                serverMap: arkGameServerConfigs,
                ftpService: new FtpClient(this.logger),
            });
        } catch (e) {
            this.logger.error(
                `Error running backups: ${e.message}`,
                e.stack,
                'BackupCron',
            );
        }
        this.logger.log('Finished running BackupCron', 'BackupCron');
    }
}
