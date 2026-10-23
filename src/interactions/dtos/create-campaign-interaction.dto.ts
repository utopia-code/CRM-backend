import { Type } from 'class-transformer';
import { IsEnum, IsInt, Min } from 'class-validator';
import { CampaignResult } from '../enums/campaign-result';
import { CreateInteractionDto } from './create-interaction.dto';

export class CreateCampaignInteractionDto extends CreateInteractionDto {
  @IsEnum(CampaignResult)
  campaignResult: CampaignResult;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  campaignClientId: number;
}
