import { CampaignResult } from '../enums/campaign-result';
import { InteractionDto } from './interaction.dto';

export class InteractionCampaignDto extends InteractionDto {
  campaignResult: CampaignResult;
  campaignClientId: number;
}
