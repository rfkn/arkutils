import { Module } from '@nestjs/common';
import { BackupProfilesCron } from './backup-profiles.cron';
import { AppLogger } from 'src/logger';
import { NitradoModule } from 'src/nitrado/nitrado.module';
import { FileStorageModule } from 'src/file-storage/file-storage.module';

@Module({
    imports: [NitradoModule, FileStorageModule],
    controllers: [],
    providers: [BackupProfilesCron, AppLogger],
    exports: [BackupProfilesCron],
})
export class CronsModule {}
