import { ServerProps } from 'src/game-server/domain/entities/game-server';
import { GameName } from '../../../domain/types/game-names.enum';
import {
    ArkMapConfiguration,
    ArkMapName,
} from '../../../application/backup-managers/ark/ark-map-configuration';

const TheCenterConfiguration = new ArkMapConfiguration({
    gameName: GameName.Ark,
    serverName: 'My Ark Server',
    mapFolderName: ArkMapName.TheCenter,
    mapDisplayName: 'The Center',
    baseSavePath: 'arksa/ShooterGame/Saved/SavedArks',
    profileExtensionRegex:
        '.arkprofile|.profilebak|.arktribe|.arktribebak|.arktributetribe|.formertribeownerlog',
});

export const TheCenterServerConfiguration: ServerProps<ArkMapConfiguration> = {
    backupsDestinationDirectory: 'The_Center',
    connectionDetails: {
        host: 'test.test.io',
        port: 21,
        user: 'utester',
        password: 'test1234',
    },
    gameConfiguration: TheCenterConfiguration,
    gameName: GameName.Ark,
};
