import { IsEnum, IsInt, IsNumber, IsOptional, Min } from 'class-validator';
import { ProposalStatus } from '../enums/proposal-status.enum';
import { CreateInteractionDto } from './create-interaction.dto';

export class CreateProposalInteractionDto extends CreateInteractionDto {
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount?: number;

  @IsOptional()
  @IsEnum(ProposalStatus)
  proposalStatus?: ProposalStatus;

  @IsInt()
  @Min(1)
  clientId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  showId?: number;
}
