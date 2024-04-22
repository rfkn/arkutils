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
      envFilePath: `src/env/.env.${process.env.NODE_ENV}`,
      isGlobal: true,
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
