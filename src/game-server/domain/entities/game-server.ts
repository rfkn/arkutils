import { FtpConnectionProps, IFtpService } from "../interfaces/i-ftp-service.interface";
import { IGameBackupManager } from "../interfaces/i-game-backup-manager.interface";

export const SAVE_PATH = "arksa/ShooterGame/Saved/SavedArks";

export interface IGameConfiguration {
    serverName: string;
};

export interface GameServerProps<T extends IGameConfiguration> {
    gameName: string;
    connectionDetails: FtpConnectionProps;
    gameConfiguration: T;
    backupsDestinationDirectory: string;
}

export class GameServer<T extends IGameConfiguration> implements GameServerProps<T> {
    readonly gameName: string;
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
        }: GameServerProps<T>
    ) {
        this.gameName = gameName;
        this.gameConfiguration = gameConfiguration;
        this.backupsDestinationDirectory = backupsDestinationDirectory;
        this._connectionDetails = connectionDetails;
    }

    set connectionDetails(connectionDetails: FtpConnectionProps) {
        this.ftpService.disconnect();
        this._connectionDetails = connectionDetails;
    }

    get connectionDetails(): FtpConnectionProps {
        return this._connectionDetails;
    }

    async runBackup(backupManager: IGameBackupManager<T>): Promise<void> {
        await this.ftpService.reconnect(this.connectionDetails);
        try {
            await backupManager.runBackup(
                this.ftpService,
                this.gameConfiguration,
                this.backupsDestinationDirectory
            );
        } catch (e) {
            await this.ftpService.disconnect();
            throw e;
        }
        await this.ftpService.disconnect();
    }
}
