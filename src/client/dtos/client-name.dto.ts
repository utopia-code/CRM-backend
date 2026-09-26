import { IsString } from 'class-validator';

export class ClientNameDto {
  id: number;

  @IsString()
  organization: string;
}
