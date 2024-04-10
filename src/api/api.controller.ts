import { Controller, Get } from "@nestjs/common";
import { BackupProfilesCron } from "src/crons/backup-profiles.cron";
import { ArkMap } from "src/nitrado/common/constants";
import { NitradoFtpService } from "src/nitrado/services/nitrado-ftp.service";

@Controller('/api')
export class ApiController {
    constructor(private readonly backupProfilesCron: BackupProfilesCron) {}

    @Get('backup-profiles')
    async backupProfiles() {
        const result = await this.backupProfilesCron.backupProfiles();
        return {
            files: result,
        }
    }
}
