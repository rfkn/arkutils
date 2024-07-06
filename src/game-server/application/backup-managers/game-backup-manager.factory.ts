import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { IGameBackupManager } from '../../domain/interfaces/i-game-backup-manager.interface';
import { IGameConfiguration } from '../../domain/entities/game-server';
import { GameConfigurationType } from '../common/types/game-configurations.type';
import { GameName } from '../../domain/types/game-names.enum';
import { ArkAscendedBackupManager } from './ark/ark-backup-manager';

@Injectable()
export class GameBackupManagerFactory {
    constructor(private readonly moduleRef: ModuleRef) {}

    async create<T extends IGameConfiguration>(
        gameConfig: GameConfigurationType,
    ): Promise<IGameBackupManager<T>> {
        switch (gameConfig.gameName) {
            case GameName.Ark:
                // TODO validation to make sure the config structure actually matches the type
                return this.moduleRef.get(ArkAscendedBackupManager, {
                    strict: true,
                });
            default:
                throw new Error(
                    `Game name ${gameConfig.gameName} is not supported for backups`,
                );
        }
    }
}

// Aggregated for module injection
export const BackupManagers = [
    GameBackupManagerFactory,
    ArkAscendedBackupManager,
] as const;
