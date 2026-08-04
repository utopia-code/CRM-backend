import {
  IsDateString,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

export class BackupContactDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsDateString()
  createdAt: string;

  @IsOptional()
  @IsDateString()
  deletedAt?: string | null;
}
