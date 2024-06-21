import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppLogger } from './logger';
import { ApiModule } from './api/api.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { GameServerModule } from './game-server/game-server.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `${__dirname}/env/.env.${process.env.NODE_ENV}`,
            isGlobal: true,
            validate: (config) => {
                if (!config.NODE_ENV) {
                    throw new Error('NODE_ENV not provided');
                }
                if (!config.LOCAL_BACKUPS_PATH) {
                    throw new Error(
                        'LOCAL_BACKUPS_PATH env variable not provided',
                    );
                }
                return config;
            },
        }),
        ScheduleModule.forRoot(),
        ApiModule,
        FileStorageModule,
        GameServerModule,
    ],
    controllers: [],
    providers: [AppLogger],
})
export class AppModule {}
