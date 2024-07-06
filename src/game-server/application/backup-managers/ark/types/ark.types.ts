import { ArkMapConfiguration } from '../ark-map-configuration';
import { ServerProps } from '../../../../domain/entities/game-server';

export type ArkGameServerDictionary = Record<
    string,
    ServerProps<ArkMapConfiguration>
>;
