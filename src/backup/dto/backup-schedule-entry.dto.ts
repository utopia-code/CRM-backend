import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

import { ReminderStatus } from 'src/schedule/enums/reminder-status.enum';
import { ScheduleType } from 'src/schedule/enums/schedule-type.enum';

export class BackupScheduleEntryDto {
  @IsInt()
  id: number;

  @IsEnum(ScheduleType)
  type: ScheduleType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsDateString()
  startDate: string;

  @IsOptional()
  @IsDateString()
  endDate?: string | null;

  @IsOptional()
  @IsDateString()
  reminderDate?: string | null;

  @IsEnum(ReminderStatus)
  reminderStatus: ReminderStatus;

  // RELATIONSHIPS

  @IsOptional()
  @IsInt()
  taskId?: number | null;

  @IsOptional()
  @IsInt()
  interactionId?: number | null;
}
