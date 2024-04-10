import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CronsModule } from './crons/crons.module';
import { AppLogger } from './logger';
import { ApiModule } from './api/api.module';
import { FileStorageModule } from './file-storage/file-storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: `src/env/.env.${process.env.NODE_ENV}`,
      isGlobal: true,
    }),
    CronsModule,
    ApiModule,
    FileStorageModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppLogger],
})
export class AppModule {}
