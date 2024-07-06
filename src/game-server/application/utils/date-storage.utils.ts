import { FileInfo } from 'basic-ftp';

export class DateStorageUtils {
    static folderDateToIsoString(folder: string): string {
        // folder name format: 2024-04-21_03.02.11.921Z
        const folderDate = folder
            .replace('_', 'T')
            .replace('.', ':')
            .replace('.', ':');
        return folderDate;
    }

    static getOnlyDateFolders(folders: string[]): string[] {
        // folder name format: 2024-04-21_03.02.11.921Z
        const dateFolderRegex =
            /^\d{4}-\d{2}-\d{2}_\d{2}\.\d{2}\.\d{2}\.\d{3}Z$/;
        const dateFolders = folders.filter((folder) =>
            dateFolderRegex.test(folder),
        );
        return dateFolders;
    }

    static parseDateFromFile(file: FileInfo): Date {
        const datePattern = /\d{2}\.\d{2}\.\d{4}_\d{2}\.\d{2}\.\d{2}/;
        const dateMatch = file.name.match(datePattern);
        if (!dateMatch) {
            throw new Error(`Invalid filename: ${file.name}`);
        }
        const [day, month, year, hours, minutes, seconds] = dateMatch[0]
            .split(/[._]/)
            .map(Number);
        return new Date(year, month - 1, day, hours, minutes, seconds);
    }

    static getMostRecentFile(files: FileInfo[]): FileInfo {
        const mostRecentFile = files.reduce(
            (mostRecent, file) => {
                const fileDate = DateStorageUtils.parseDateFromFile(file);
                if (
                    !mostRecent ||
                    fileDate > DateStorageUtils.parseDateFromFile(mostRecent)
                ) {
                    return file;
                } else {
                    return mostRecent;
                }
            },
            null as FileInfo | null,
        );

        if (!mostRecentFile) {
            const fileNames = files.map((file) => file.name);
            throw new Error(
                `No most recent backup file found in file list: ${JSON.stringify(fileNames, null, 2)}`,
            );
        }

        return mostRecentFile;
    }

    static getDateAsFolderName(date = new Date()) {
        return date.toISOString().replaceAll(':', '.').replace('T', '_');
    }
}
