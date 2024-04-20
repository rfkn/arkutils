import * as ftp from 'basic-ftp';
import { AppFileBuffer } from 'src/common/types/app-file.interface';

export interface FtpConnectionProps {
    host: string;
    port: number;
    user: string;
    password: string;
}

export interface IFtpService {
    connect(connectionDetails: FtpConnectionProps): Promise<void>;
    reconnect(connectionDetails: FtpConnectionProps): Promise<void>;
    disconnect(): Promise<void>;
    isConnected(): boolean;
    listFiles(path: string): Promise<ftp.FileInfo[]>;
    downloadFileToBuffer(fileName: string, destinationPath: string): Promise<AppFileBuffer>;
    uploadFile(path: string, buffer: AppFileBuffer): Promise<void>;
    deleteFile(path: string): Promise<void>;
}
