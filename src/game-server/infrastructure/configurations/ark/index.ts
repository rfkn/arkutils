import { ArkMapConfiguration } from 'src/game-server/application/interfaces/ark-game-configuration.interface';
import {
    BigChickenScorchedEarthConfiguration,
    BigChickenServerConfiguration,
} from './big-chicken-thunderdome.configuration';
import {
    PouchTouchServerConfiguration,
    PouchTouchTheIslandConfiguration,
} from './pouch-touch.configuration';
import { GameServerProps } from 'src/game-server/domain/entities/game-server';

export const arkGameConfigs = [
    BigChickenScorchedEarthConfiguration,
    PouchTouchTheIslandConfiguration,
];

export const arkGameServerConfigs: Record<
    string,
    GameServerProps<ArkMapConfiguration>
> = {
    [BigChickenScorchedEarthConfiguration.serverName]:
        BigChickenServerConfiguration,
    [PouchTouchTheIslandConfiguration.serverName]:
        PouchTouchServerConfiguration,
};
