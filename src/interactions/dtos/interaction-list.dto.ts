import { CampaignResult } from '../enums/campaign-result';
import { InteractionCategory } from '../enums/interaction-category.enum';
import { InteractionType } from '../enums/interaction-type.enum';
import { ProposalStatus } from '../enums/proposal-status.enum';

export class InteractionListDto {
  id: number;
  category: InteractionCategory;
  type: InteractionType;
  subject: string;
  startDate: Date;
  organization: string | null;
  clientId: number | null;
}

export class InteractionDetailDto extends InteractionListDto {
  notes: string | null;
  duration: number | null;
  campaignClientId: number | null;
  campaignResult: CampaignResult | null;
  showId: number | null;
  amount: number | null;
  proposalStatus: ProposalStatus | null;
}
