import { IsEnum, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ProposalStatus } from '../enums/proposal-status.enum';
import { CreateInteractionDto } from './create-interaction.dto';

export class CreateProposalInteractionDto extends CreateInteractionDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount?: number;

  @IsEnum(ProposalStatus)
  proposalStatus: ProposalStatus;

  @IsOptional()
  @IsInt()
  @Min(1)
  showId?: number;
}
