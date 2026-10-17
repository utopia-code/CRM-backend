import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { CampaignStatus } from '../enums/campaign-status.enum';

export class CreateCampaignDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(CampaignStatus)
  status?: CampaignStatus;

  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date | null;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date | null;
}
