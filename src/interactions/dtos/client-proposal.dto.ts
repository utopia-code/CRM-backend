import { ProposalStatus } from '../enums/proposal-status.enum';
import { InteractionDto } from './interaction.dto';

export class ClientProposalDto extends InteractionDto {
  amount: number | null;
  proposalStatus: ProposalStatus;
  show: string | null;
}
