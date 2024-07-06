import { ArkMapConfiguration } from '../backup-managers/ark/ark-map-configuration';
import { ServerProps } from '../../domain/entities/game-server';
import { MockGameConfig } from './mock-game-config.type';

/**
 * A discriminated union type for all supported game configurations.
 * New games should be added to this union, each with a distinct GameName
 * property.
 *
 * MockGameConfig is here to make sure the discriminated union logic works
 * and can be removed when a second game is added.
 */
export type GameConfigurationType = MockGameConfig | ArkMapConfiguration;

export type ServerConfig = ServerProps<GameConfigurationType>;

export type ServerMap = {
    [serverName: string]: ServerConfig;
};
