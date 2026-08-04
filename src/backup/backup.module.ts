import { Module } from '@nestjs/common';
import { BackupController } from './backup.controller';
import { ExportService } from './export/export.service';
import { RestoreService } from './restore/restore.service';

@Module({
  controllers: [BackupController],
  providers: [ExportService, RestoreService],
})
export class BackupModule {}
