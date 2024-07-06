import { CopyLatestBackupToFolderUseCase } from './copy-latest-backup-to-folder.use-case';
import { DeleteOlderBackupsUseCase } from './delete-older-backups.use-case';
import { RunBackupUseCase } from './run-backup.use-case';

export default [
    CopyLatestBackupToFolderUseCase,
    DeleteOlderBackupsUseCase,
    RunBackupUseCase,
];
