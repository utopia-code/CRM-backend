import { PartialType } from '@nestjs/mapped-types';
import { CreateCampaignInteractionDto } from './create-campaign-interaction.dto';

export class UpdateCampaignInteractionDto extends PartialType(
  CreateCampaignInteractionDto,
) {}
