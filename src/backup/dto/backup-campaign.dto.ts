import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { CampaignStatus } from '../../campaigns/enums/campaign-status.enum';

export class BackupCampaignDto {
  @IsInt()
  id: number;

  @IsString()
  name: string;

  @IsEnum(CampaignStatus)
  status: CampaignStatus;

  @IsOptional()
  @IsString()
  description: string | null;
}
