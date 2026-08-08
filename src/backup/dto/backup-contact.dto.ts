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
  role?: string | null;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsString()
  telephone?: string | null;

  @IsDateString()
  createdAt: string;

  @IsOptional()
  @IsDateString()
  deletedAt?: string | null;
}
