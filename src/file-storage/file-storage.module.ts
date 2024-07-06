import { Module } from '@nestjs/common';
import { AppLogger } from 'src/logger';
import { LocalFileStorageService } from './infrastructure/local-file-storage.service';
import { IFileStorageService } from './application/file-storage-service.interface';

@Module({
    imports: [],
    controllers: [],
    providers: [
        AppLogger,
        {
            provide: IFileStorageService,
            useClass: LocalFileStorageService,
        },
    ],
    exports: [IFileStorageService],
})
export class FileStorageModule {}
