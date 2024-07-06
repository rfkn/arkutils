import { GameName } from '../../../domain/types/game-names.enum';
import { IGameConfiguration } from '../../../domain/entities/game-server';

export class MockGameConfig implements IGameConfiguration {
    readonly gameName: GameName.Demo;
    readonly serverName: string;
    readonly baseSavePath: string;

    constructor({ serverName, baseSavePath }: IGameConfiguration) {
        this.serverName = serverName;
        this.baseSavePath = baseSavePath;
    }
}
