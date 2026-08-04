import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { CreateTaskDto } from './create-task.dto';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  clientId?: number | null;
}
