import { ProposalStatus } from '../enums/proposal-status.enum';
import { InteractionDto } from './interaction.dto';

export class InteractionProposalDto extends InteractionDto {
  amount: number | null;
  proposalStatus: ProposalStatus;
  showId: number | null;
  showName: string | null;
}
