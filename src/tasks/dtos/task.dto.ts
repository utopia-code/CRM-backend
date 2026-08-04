import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

export class TaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  clientId?: number;
}
