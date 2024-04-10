import { Injectable, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { AppLogger } from "src/logger";
import * as ftp from 'basic-ftp';
import { ArkMap, SAVE_PATH } from "../common/constants";
import { PassThrough } from "stream";
import { AppFileBuffer } from "src/file-storage/common/types/app-file.interface";

@Injectable()
export class NitradoFtpService implements OnModuleInit {
    private host: string;
    private port: number;
    private user: string;
    private password: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly logger: AppLogger,
    ) {}

    onModuleInit() {
        this.host = this.configService.get('FTP_HOST');
        this.port = this.configService.get('FTP_PORT');
        this.user = this.configService.get('FTP_USERNAME');
        this.password = this.configService.get('FTP_PASSWORD');

        if (!this.host || !this.port || !this.user || !this.password) {
            throw new Error('FTP credentials not found');
        }
    }

    async connect() {
        const client = new ftp.Client();
        try {
            await client.access({
                host: this.host,
                port: this.port,
                user: this.user,
                password: this.password,
            });
            this.logger.log('Connected to FTP server');
            return client;
        } catch (e) {
            this.logger.error(e.message);
        }
    }

    async listFiles(openClient?: ftp.Client) {
        let client: ftp.Client;
        if (openClient) {
            client = openClient;
        } else {
            client = await this.connect();
        }
        if (!client) {
            return;
        }
        try {
            const files = await client.list();
            this.logger.log(files);
            if (!openClient) {
                client.close();
            }
            return files;
        } catch (e) {
            this.logger.error(e.message);
        }
    }

    async listSavedFiles(map: ArkMap, openClient?: ftp.Client) {
        let client: ftp.Client;
        if (openClient) {
            client = openClient;
        } else {
            client = await this.connect();
        }

        if (!client) {
            this.logger.error('Failed to connect to FTP server');
            return;
        }

        try {
            await client.cd(SAVE_PATH + '/' + map);
            const files = await client.list();
            if (!openClient) {
                client.close();
            }
            this.logger.log(files);
            
            return files;
        } catch (e) {
            this.logger.error(e.message);
        }
    }

    async getProfileFilesList(map: ArkMap, openClient?: ftp.Client): Promise<ftp.FileInfo[]> {
        let client: ftp.Client;
        if (openClient) {
            client = openClient;
        } else {
            client = await this.connect();
        }

        const files = await this.listSavedFiles(map, client);
        if (!openClient) {
            client.close();
        }

        if (!files) {
            this.logger.error('Failed to list saved files');
            return;
        }
        return files.filter(file => file.name.endsWith('.arkprofile'));
    }

    async downloadFileToBuffer(filePath: string, fileName: string, openClient?: ftp.Client): Promise<AppFileBuffer> {
        let client: ftp.Client;
        if (openClient) {
            client = openClient;
        } else {
            client = await this.connect();
        }
        if (!client) {
            this.logger.error('Failed to connect to FTP server');
            return;
        }

        const stream = new PassThrough();
        const chunks: Buffer[] = [];

        stream.on('data', chunk => {
            chunks.push(chunk);
        });
        stream.on('error', e => {
            this.logger.error(e.message);
            stream.destroy();
            throw e;
        });

        try {
            await client.downloadTo(stream, filePath);
            if (!openClient) {
                client.close();
            }
        } catch (e) {
            if (!openClient) {
                client.close();
            }
            this.logger.error(e.message);
            stream.destroy();
            throw e;
        }

        return {
            name: fileName,
            path: '',
            buffer: Buffer.concat(chunks),
        };
    }
}
