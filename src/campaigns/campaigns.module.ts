import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleEntry } from 'src/schedule/entities/schedule-entry.entity';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignClient } from './entities/campaign-client.entity';
import { Campaign } from './entities/campaign.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Campaign, CampaignClient, ScheduleEntry]),
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
})
export class CampaignsModule {}
