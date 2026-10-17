import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleEntry } from 'src/schedule/entities/schedule-entry.entity';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { Campaign } from './entities/campaign.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, ScheduleEntry])],
  controllers: [CampaignsController],
  providers: [CampaignsService],
})
export class CampaignsModule {}
