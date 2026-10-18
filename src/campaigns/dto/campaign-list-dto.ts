import { CampaignStatus } from '../enums/campaign-status.enum';

export class CampaignListDto {
  id: number;
  name: string;
  status: CampaignStatus;

  summary: {
    clients: number;
    interactions: number;
  };
}
