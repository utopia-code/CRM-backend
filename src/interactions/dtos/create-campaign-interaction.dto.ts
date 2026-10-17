import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { CampaignResult } from '../enums/campaign-result';
import { CreateInteractionDto } from './create-interaction.dto';

export class CreateCampaignInteractionDto extends CreateInteractionDto {
  @IsOptional()
  @IsEnum(CampaignResult)
  campaignResult: CampaignResult;

  @IsOptional()
  @IsInt()
  campaignClientId: number;
}
