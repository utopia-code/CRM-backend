import {
  Controller,
  Get,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ExportService } from './export/export.service';
import { RestoreService } from './restore/restore.service';

interface UploadedBackupFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
}

@Controller('backup')
export class BackupController {
  constructor(
    private readonly restoreService: RestoreService,
    private readonly exportService: ExportService,
  ) {}

  @Get('export')
  async export(@Res() response: Response) {
    const backup = await this.exportService.export();

    response
      .header('Content-Type', 'application/json')
      .header(
        'Content-Disposition',
        `attachment; filename=backup-${Date.now()}.json`,
      )
      .send(JSON.stringify(backup, null, 2));
  }

  @Post('restore')
  @UseInterceptors(FileInterceptor('file'))
  async restore(
    @UploadedFile()
    file: UploadedBackupFile,
  ) {
    const backup = JSON.parse(file.buffer.toString());

    return this.restoreService.restore(backup);
  }
}
