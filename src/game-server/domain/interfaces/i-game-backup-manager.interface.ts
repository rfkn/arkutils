import { IGameConfiguration } from "../entities/game-server";
import { IFtpService } from "./i-ftp-service.interface";

export interface IGameBackupManager<T extends IGameConfiguration> {
    runBackup(ftpService: IFtpService, config: T, backupsDestinationDirectory: string): Promise<void>;
}
