import {
    FtpConnectionProps,
    IFtpService,
} from '../interfaces/i-ftp-service.interface';
import { IGameBackupManager } from '../interfaces/i-game-backup-manager.interface';
import { GameName } from '../types/game-names.enum';

export interface IGameConfiguration {
    gameName: GameName;
    serverName: string;
    baseSavePath: string;
}

export interface ServerProps<T extends IGameConfiguration> {
    gameName: T['gameName'];
    connectionDetails: FtpConnectionProps;
    gameConfiguration: T;
    backupsDestinationDirectory: string;
}

export class GameServer<T extends IGameConfiguration>
    implements ServerProps<T>
{
    readonly gameName: T['gameName'];
    readonly gameConfiguration: T;
    readonly backupsDestinationDirectory: string;
    private _connectionDetails: FtpConnectionProps;

    constructor(
        private readonly ftpService: IFtpService,
        {
            gameName,
            connectionDetails,
            gameConfiguration,
            backupsDestinationDirectory,
        }: ServerProps<T>,
    ) {
        this.gameName = gameName;
        this.gameConfiguration = gameConfiguration;
        this.backupsDestinationDirectory = backupsDestinationDirectory;
        this._connectionDetails = connectionDetails;
    }

    set connectionDetails(connectionDetails: FtpConnectionProps) {
        this.ftpService.disconnect();
        this._connectionDetails = structuredClone(connectionDetails);
    }

    get connectionDetails(): FtpConnectionProps {
        return structuredClone(this._connectionDetails);
    }

    async runBackup(backupManager: IGameBackupManager<T>): Promise<void> {
        await this.ftpService.reconnect(this.connectionDetails);
        try {
            await backupManager.runBackup(
                this.ftpService,
                this.gameConfiguration,
                this.backupsDestinationDirectory,
            );
        } catch (e) {
            await this.ftpService.disconnect();
            throw e;
        }
        await this.ftpService.disconnect();
    }
}
