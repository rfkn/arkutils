import { Injectable } from "@nestjs/common";
import { AppLogger } from "src/logger";
import { Cron } from "@nestjs/schedule";
import { RunArkBackupUseCase } from "src/game-server/application/use-cases/run-ark-backup.use-case";

@Injectable()
export class BackupCron {
    constructor(
        private readonly logger: AppLogger,
        private readonly runArkBackupsUseCase: RunArkBackupUseCase,
    ) {}

    @Cron('*/2 * * * *')
    async handleCron() {
        this.logger.log('Running BackupCron', 'BackupCron');
        try {
            await this.runArkBackupsUseCase.execute();
        } catch (e) {
            this.logger.error(
                `Error running backups: ${e.message}`,
                e.stack,
                'BackupCron'
            );
        }
        this.logger.log('Finished running BackupCron', 'BackupCron');
    }
}
