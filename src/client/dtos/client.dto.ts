import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ClientStatus } from '../enums/client-status.enum';

export class ClientDto {
  @IsString()
  organization: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsEnum(ClientStatus)
  status?: ClientStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
