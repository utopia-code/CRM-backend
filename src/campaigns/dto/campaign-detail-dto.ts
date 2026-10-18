import { CampaignResult } from 'src/interactions/enums/campaign-result';
import { InteractionType } from 'src/interactions/enums/interaction-type.enum';
import { CampaignStatus } from '../enums/campaign-status.enum';

export class CampaignContactDto {
  id: number;
  name: string;
  role: string;
  telephone: string;
  email: string;
}

export class CampaignInteractionDto {
  id: number;
  type: InteractionType;
  campaignResult: CampaignResult;
}

export class CampaignClientDetailDto {
  id: number;
  clientId: number;
  organization: string;
  contacts: CampaignContactDto[];
  interactions: CampaignInteractionDto[];
}

export class CampaignDetailDto {
  id: number;
  name: string;
  status: CampaignStatus;
  description: string | null;
  startDate: Date | null;
  endDate: Date | null;

  summary: {
    reach: {
      total: number;
      phone: number;
      email: number;
      meeting: number;
      percentage: number;

      phoneInteractions: number;
      emailInteractions: number;
      meetingInteractions: number;
    };
    results: {
      positive: number;
      pending: number;
      negative: number;
      notContacted: number;
      positivePercentage: number;
    };
  };

  clients: CampaignClientDetailDto[];
}
