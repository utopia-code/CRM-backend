import { Type } from 'class-transformer';
import { IsDateString, IsInt, ValidateNested } from 'class-validator';

import { BackupClientDto } from './backup-client.dto';
import { BackupInteractionDto } from './backup-interaction.dto';
import { BackupScheduleEntryDto } from './backup-schedule-entry.dto';
import { BackupShowDto } from './backup-show.dto';
import { BackupTaskDto } from './backup-task.dto';

export class BackupDto {
  @IsInt()
  version: number;

  @IsDateString()
  createdAt: string;

  @ValidateNested()
  @Type(() => BackupDataDto)
  data: BackupDataDto;
}

export class BackupDataDto {
  @ValidateNested({ each: true })
  @Type(() => BackupClientDto)
  clients: BackupClientDto[];

  @ValidateNested({ each: true })
  @Type(() => BackupShowDto)
  shows: BackupShowDto[];

  @ValidateNested({ each: true })
  @Type(() => BackupTaskDto)
  tasks: BackupTaskDto[];

  @ValidateNested({ each: true })
  @Type(() => BackupInteractionDto)
  interactions: BackupInteractionDto[];

  @ValidateNested({ each: true })
  @Type(() => BackupScheduleEntryDto)
  scheduleEntries: BackupScheduleEntryDto[];
}
