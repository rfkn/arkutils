import {
    ArkMapConfiguration,
    ArkMapName,
} from 'src/game-server/application/interfaces/ark-game-configuration.interface';
import { GameServerProps } from 'src/game-server/domain/entities/game-server';

const ScorchedEarthConfiguration = new ArkMapConfiguration({
    serverName: 'My Ark Server',
    mapFolderName: ArkMapName.ScorchedEarth,
    mapDisplayName: 'Scorched Earth',
    baseSavePath: 'arksa/ShooterGame/Saved/SavedArks',
    profileExtensionRegex:
        '.arkprofile|.profilebak|.arktribe|.arktribebak|.arktributetribe|.formertribeownerlog',
});

export const ScorchedEarthServerConfiguration: GameServerProps<ArkMapConfiguration> =
    {
        backupsDestinationDirectory: 'Scorched_Earth',
        connectionDetails: {
            host: 'test.test.io',
            port: 21,
            user: 'utester',
            password: 'test1234',
        },
        gameConfiguration: ScorchedEarthConfiguration,
        gameName: 'Ark Ascended',
    };
