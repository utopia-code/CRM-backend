import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { ClientStatus } from 'src/client/enums/client-status.enum';
import { BackupContactDto } from './backup-contact.dto';

export class BackupClientDto {
  @IsInt()
  id: number;

  @IsString()
  organization: string;

  @IsOptional()
  @IsString()
  subject?: string | null;

  @IsEnum(ClientStatus)
  status: ClientStatus;

  @IsOptional()
  @IsString()
  notes?: string | null;

  @IsDateString()
  createdAt: string;

  @IsOptional()
  @IsDateString()
  deletedAt?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BackupContactDto)
  contacts: BackupContactDto[];
}
