import {
    TheIslandServerConfiguration,
    TheIslandConfiguration,
} from './the-island.configuration';
import { ServerProps } from 'src/game-server/domain/entities/game-server';
import { ArkMapConfiguration } from '../../../application/backup-managers/ark/ark-map-configuration';
import {
    TheCenterConfiguration,
    TheCenterServerConfiguration,
} from './the-center.configuration';

export const arkGameConfigs = [TheIslandConfiguration, TheCenterConfiguration];

export const arkGameServerConfigs: Record<
    string,
    ServerProps<ArkMapConfiguration>
> = {
    [TheIslandConfiguration.serverName]: TheIslandServerConfiguration,
    [TheCenterConfiguration.serverName]: TheCenterServerConfiguration,
};
