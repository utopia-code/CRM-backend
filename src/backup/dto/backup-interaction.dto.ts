import {
  IsEnum,
  IsInt,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';
import { CampaignResult } from 'src/interactions/enums/campaign-result';
import { InteractionCategory } from 'src/interactions/enums/interaction-category.enum';
import { InteractionType } from 'src/interactions/enums/interaction-type.enum';
import { ProposalStatus } from 'src/interactions/enums/proposal-status.enum';

export class BackupInteractionDto {
  @IsInt()
  id: number;

  @IsEnum(InteractionCategory)
  category: InteractionCategory;

  @IsEnum(InteractionType)
  type: InteractionType;

  @IsString()
  subject: string;

  @IsOptional()
  @IsString()
  notes: string | null;

  @IsOptional()
  @IsInt()
  duration: number | null;

  @IsEnum(CampaignResult)
  campaignResult: CampaignResult;

  @IsOptional()
  @IsNumberString()
  amount: string | null;

  @IsEnum(ProposalStatus)
  status: ProposalStatus;

  // RELATIONSHIPS

  @IsOptional()
  @IsInt()
  clientId: number | null;

  @IsOptional()
  @IsInt()
  taskId: number | null;

  @IsOptional()
  @IsInt()
  showId: number | null;
}
