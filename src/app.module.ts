import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppLogger } from './logger';
import { FileStorageModule } from './file-storage/file-storage.module';
import { GameServerModule } from './game-server/game-server.module';
import { ScheduleModule } from '@nestjs/schedule';
import { Env } from './env/env.enum';

@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: `${__dirname}/env/.env.${process.env.NODE_ENV}`,
            isGlobal: true,
            validate: (config) => {
                for (const envVar of Object.values(Env)) {
                    if (config[envVar] === undefined) {
                        throw new Error(`Missing env var: ${envVar}`);
                    }
                }
                return config;
            },
        }),
        ScheduleModule.forRoot(),
        FileStorageModule,
        GameServerModule,
    ],
    controllers: [],
    providers: [AppLogger],
})
export class AppModule {}
