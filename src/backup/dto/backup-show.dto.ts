import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class BackupShowDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsString()
  company: string;

  @IsInt()
  duration: number;

  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  cost: number | null;

  @IsOptional()
  @IsString()
  audience: string | null;

  @IsOptional()
  @IsString()
  spaceType: string | null;

  @IsOptional()
  @IsString()
  description: string | null;

  @IsDateString()
  createdAt: string;

  @IsOptional()
  @IsDateString()
  deletedAt: string | null;
}
