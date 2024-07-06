import { IGameConfiguration } from 'src/game-server/domain/entities/game-server';
import { GameName } from '../../../domain/types/game-names.enum';

export enum ArkMapName {
    TheIsland = 'TheIsland_WP',
    ScorchedEarth = 'ScorchedEarth_WP',
    TheCenter = 'TheCenter_WP',
}

export type ArkMapConfigurationProps = IGameConfiguration & {
    mapFolderName: ArkMapName;
    mapDisplayName: string;
    profileExtensionRegex: string;
};

export class ArkMapConfiguration implements ArkMapConfigurationProps {
    readonly gameName = GameName.Ark;
    readonly serverName: string;
    readonly mapFolderName: ArkMapName;
    readonly mapDisplayName: string;
    readonly baseSavePath: string;
    readonly profileExtensionRegex: string;

    constructor({
        serverName,
        mapFolderName,
        mapDisplayName,
        baseSavePath,
        profileExtensionRegex,
    }: ArkMapConfigurationProps) {
        this.serverName = serverName;
        this.mapFolderName = mapFolderName;
        this.mapDisplayName = mapDisplayName;
        this.baseSavePath = baseSavePath;
        this.profileExtensionRegex = profileExtensionRegex;
    }
}
