import * as ftp from 'basic-ftp';
import {
    FtpConnectionProps,
    IFtpService,
} from 'src/game-server/domain/interfaces/i-ftp-service.interface';
import { AppLogger } from 'src/logger';
import { AppFileBuffer } from 'src/common/types/app-file.interface';
import { PassThrough } from 'stream';

export class FtpClient implements IFtpService {
    private client: ftp.Client;

    constructor(private readonly logger: AppLogger) {
        this.client = new ftp.Client();
    }

    async connect(connectionDetails: FtpConnectionProps): Promise<void> {
        if (this.client) {
            this.client.close();
        }
        this.client = new ftp.Client();
        this.logger.log(
            `Connecting to FTP server: ${connectionDetails.host}...`,
            'FtpClient.connect',
        );
        await this.client.access({
            host: connectionDetails.host,
            port: connectionDetails.port,
            user: connectionDetails.user,
            password: connectionDetails.password,
        });
        this.logger.log('Connected to FTP server', 'FtpClient.connect');
    }

    async reconnect(connectionDetails: FtpConnectionProps): Promise<void> {
        if (!this.client.closed) {
            await this.disconnect();
        }
        await this.connect(connectionDetails);
    }

    async recover(): Promise<void> {
        if (!this.client.closed) {
            return;
        }
        this.logger.log(
            'Recovering connection to FTP server...',
            'FtpClient.recover',
        );
        await this.client.access();
    }

    async disconnect(): Promise<void> {
        if (this.client.closed) {
            this.logger.log(
                'FTP client already disconnected',
                'FtpClient.disconnect',
            );
            return;
        }
        this.client.close();
        this.logger.log('Disconnected from FTP server', 'FtpClient.disconnect');
    }

    isConnected(): boolean {
        return !this.client.closed;
    }

    async listFiles(path: string): Promise<ftp.FileInfo[]> {
        const files = await this.client.list(path);
        const fileNames = files.map((file) => file.name);
        this.logger.log(
            `Listing files:\n ${JSON.stringify(fileNames, null, 2)}`,
            'FtpClient.listFiles',
        );
        return files;
    }

    async downloadFileToBuffer(
        fileName: string,
        filePath: string,
    ): Promise<AppFileBuffer> {
        this.logger.log(
            `Downloading file: ${fileName}...`,
            'FtpClient.downloadFileToBuffer',
        );

        const stream = new PassThrough();
        const chunks: Buffer[] = [];

        stream.on('data', (chunk) => {
            chunks.push(chunk);
        });
        stream.on('error', (e) => {
            this.logger.error(e.message, 'FtpClient.downloadFileToBuffer');
            stream.destroy();
            throw e;
        });

        try {
            await this.client.downloadTo(stream, filePath);
        } catch (e) {
            this.logger.error(e.message, 'FtpClient.downloadFileToBuffer');
            stream.destroy();
            throw e;
        }

        this.logger.log(
            `Downloaded file: ${fileName}`,
            'FtpClient.downloadFileToBuffer',
        );

        return {
            name: fileName,
            path: '',
            buffer: Buffer.concat(chunks),
        };
    }

    async uploadFile(path: string, buffer: AppFileBuffer): Promise<void> {
        this.logger.log(
            `Uploading file: ${buffer.name}...`,
            'FtpClient.uploadFile',
        );

        const stream = new PassThrough();
        stream.end(buffer.buffer);

        try {
            await this.client.uploadFrom(stream, path);
        } catch (e) {
            this.logger.error(e.message, 'FtpClient.uploadFile');
            stream.destroy();
            throw e;
        }

        this.logger.log(
            `Uploaded file: ${buffer.name}`,
            'FtpClient.uploadFile',
        );
    }

    async deleteFile(path: string): Promise<void> {
        this.logger.log(`Deleting file: ${path}...`, 'FtpClient.deleteFile');

        try {
            await this.client.remove(path);
        } catch (e) {
            this.logger.error(e.message, 'FtpClient.deleteFile');
            throw e;
        }

        this.logger.log(`Deleted file: ${path}`, 'FtpClient.deleteFile');
    }
}
