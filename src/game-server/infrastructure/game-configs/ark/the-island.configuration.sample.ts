import { ServerProps } from 'src/game-server/domain/entities/game-server';
import { GameName } from '../../../domain/types/game-names.enum';
import {
    ArkMapConfiguration,
    ArkMapName,
} from '../../../application/backup-managers/ark/ark-map-configuration';

export const TheIslandConfiguration = new ArkMapConfiguration({
    gameName: GameName.Ark,
    serverName: 'My Ark Server',
    mapFolderName: ArkMapName.TheIsland,
    mapDisplayName: 'Scorched Earth',
    baseSavePath: 'arksa/ShooterGame/Saved/SavedArks',
    profileExtensionRegex:
        '.arkprofile|.profilebak|.arktribe|.arktribebak|.arktributetribe|.formertribeownerlog',
});

export const TheIslandServerConfiguration: ServerProps<ArkMapConfiguration> = {
    backupsDestinationDirectory: 'The_Island',
    connectionDetails: {
        host: 'test.test.io',
        port: 21,
        user: 'utester',
        password: 'test1234',
    },
    gameConfiguration: TheIslandConfiguration,
    gameName: GameName.Ark,
};
