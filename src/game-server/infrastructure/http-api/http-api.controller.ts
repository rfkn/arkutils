import { Controller, Post } from '@nestjs/common';
import { RunBackupUseCase } from 'src/game-server/application/use-cases/run-backup.use-case';
import { arkGameConfigs, arkGameServerConfigs } from '../game-configs/ark';
import { FtpClient } from '../ftp-client';
import { AppLogger } from '../../../logger';

@Controller('/api')
export class HttpApiController {
    constructor(
        private readonly logger: AppLogger,
        private readonly runBackupsUseCase: RunBackupUseCase,
    ) {}

    @Post('ark/backup')
    async backupProfiles() {
        this.logger.log(
            'Running API-triggered backup',
            'HttpApiController.backupProfiles',
        );
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
                'HttpApiController.backupProfiles',
            );
        }
        this.logger.log(
            'Finished running API-triggered backup',
            'HttpApiController.backupProfiles',
        );
    }
}
