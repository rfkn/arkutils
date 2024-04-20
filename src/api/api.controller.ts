import { Controller, Post } from "@nestjs/common";
import { RunArkBackupUseCase } from "src/game-server/application/use-cases/run-ark-backup.use-case";

@Controller('/api')
export class ApiController {
    constructor(
        private readonly runArkBackupsUseCase: RunArkBackupUseCase,
    ) {}

    @Post('backup-profiles')
    async backupProfiles() {
        await this.runArkBackupsUseCase.execute();
    }
}
