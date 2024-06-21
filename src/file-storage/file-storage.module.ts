import { Module } from '@nestjs/common';
import { AppLogger } from 'src/logger';
import { FileStorageService } from './file-storage.service';

@Module({
    imports: [],
    controllers: [],
    providers: [AppLogger, FileStorageService],
    exports: [FileStorageService],
})
export class FileStorageModule {}
