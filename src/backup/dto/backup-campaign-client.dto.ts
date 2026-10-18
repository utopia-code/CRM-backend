import { IsInt, IsString } from 'class-validator';

export class BackupCampaignClientDto {
  @IsInt()
  id: number;

  @IsInt()
  campaignId: number;

  @IsInt()
  clientId: number;

  @IsString()
  createdAt: string;
}
