import {
    ArkMapConfiguration,
    ArkMapName,
} from 'src/game-server/application/interfaces/ark-game-configuration.interface';
import { GameServerProps } from 'src/game-server/domain/entities/game-server';

const TheIslandConfiguration = new ArkMapConfiguration({
    serverName: 'My Ark Server',
    mapFolderName: ArkMapName.TheIsland,
    mapDisplayName: 'Scorched Earth',
    baseSavePath: 'arksa/ShooterGame/Saved/SavedArks',
    profileExtensionRegex:
        '.arkprofile|.profilebak|.arktribe|.arktribebak|.arktributetribe|.formertribeownerlog',
});

export const TheIslandServerConfiguration: GameServerProps<ArkMapConfiguration> =
    {
        backupsDestinationDirectory: 'The_Island',
        connectionDetails: {
            host: 'test.test.io',
            port: 21,
            user: 'utester',
            password: 'test1234',
        },
        gameConfiguration: TheIslandConfiguration,
        gameName: 'Ark Ascended',
    };
