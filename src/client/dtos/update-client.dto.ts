import { PartialType } from '@nestjs/mapped-types';
import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { ClientDto } from './client.dto';
import { UpdateContactDto } from './update-contact.dto';

export class UpdateClientDto extends PartialType(ClientDto) {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateContactDto)
  contacts?: UpdateContactDto[];
}
