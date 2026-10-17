import { PartialType } from '@nestjs/mapped-types';
import { CreateProposalInteractionDto } from './create-proposal-interaction.dto';

export class UpdateProposalInteractionDto extends PartialType(
  CreateProposalInteractionDto,
) {}
