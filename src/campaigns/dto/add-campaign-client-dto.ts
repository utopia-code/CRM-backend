import { Type } from 'class-transformer';
import { IsInt } from 'class-validator';

export class AddCampaignClientDto {
  @IsInt()
  @Type(() => Number)
  clientId: number;
}
