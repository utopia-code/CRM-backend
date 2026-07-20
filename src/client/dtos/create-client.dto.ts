import { Type } from 'class-transformer';
import { IsOptional, ValidateNested } from 'class-validator';
import { ClientDto } from './client.dto';
import { CreateContactDto } from './create-contact.dto';

export class CreateClientDto extends ClientDto {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateContactDto)
  contacts?: CreateContactDto[];
}
