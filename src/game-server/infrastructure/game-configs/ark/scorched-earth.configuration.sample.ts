import {
    ArkMapConfiguration,
    ArkMapName,
} from '../../../application/backup-managers/ark/ark-map-configuration';
import { ServerProps } from 'src/game-server/domain/entities/game-server';
import { GameName } from '../../../domain/types/game-names.enum';

const ScorchedEarthConfiguration = new ArkMapConfiguration({
    gameName: GameName.Ark,
    serverName: 'My Ark Server',
    mapFolderName: ArkMapName.ScorchedEarth,
    mapDisplayName: 'Scorched Earth',
    baseSavePath: 'arksa/ShooterGame/Saved/SavedArks',
    profileExtensionRegex:
        '.arkprofile|.profilebak|.arktribe|.arktribebak|.arktributetribe|.formertribeownerlog',
});

export const ScorchedEarthServerConfiguration: ServerProps<ArkMapConfiguration> =
    {
        backupsDestinationDirectory: 'Scorched_Earth',
        connectionDetails: {
            host: 'test.test.io',
            port: 21,
            user: 'utester',
            password: 'test1234',
        },
        gameConfiguration: ScorchedEarthConfiguration,
        gameName: GameName.Ark,
    };
