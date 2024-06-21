import { IGameConfiguration } from 'src/game-server/domain/entities/game-server';

export enum ArkMapName {
    TheIsland = 'TheIsland_WP',
    ScorchedEarth = 'ScorchedEarth_WP',
}

export interface ArkMapConfigurationProps {
    serverName: string;
    mapFolderName: ArkMapName;
    mapDisplayName: string;
    baseSavePath: string;
    profileExtensionRegex: string;
}

export class ArkMapConfiguration
    implements IGameConfiguration, ArkMapConfigurationProps
{
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
