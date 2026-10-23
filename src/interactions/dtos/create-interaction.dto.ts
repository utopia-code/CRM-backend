import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { InteractionType } from '../enums/interaction-type.enum';

export class CreateInteractionDto {
  @IsEnum(InteractionType)
  type: InteractionType;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  duration?: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  clientId: number;

  @IsDateString()
  startDate: string;
}
