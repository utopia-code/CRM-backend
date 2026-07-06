import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { ScheduleType } from '../enums/schedule-type.enum';

export class CreateScheduleEntryDto {
  @IsEnum(ScheduleType)
  type: ScheduleType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsDateString()
  startDate: Date;

  @IsOptional()
  @IsDateString()
  endDate?: Date;

  @IsOptional()
  @IsDateString()
  reminderDate?: Date;

  @IsOptional()
  @IsInt()
  taskId?: number;

  @IsOptional()
  @IsInt()
  interactionId?: number;
}
