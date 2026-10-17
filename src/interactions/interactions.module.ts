import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from 'src/campaigns/entities/campaign.entity';
import { Show } from 'src/catalog/entities/show.entity';
import { Client } from 'src/client/entities/client.entity';
import { CampaignClient } from './entities/campaign-client.entity';
import { Interaction } from './entities/interaction.entity';
import { InteractionsController } from './interactions.controller';
import { InteractionsService } from './interactions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Interaction,
      Client,
      CampaignClient,
      Campaign,
      Show,
    ]),
  ],
  providers: [InteractionsService],
  controllers: [InteractionsController],
  exports: [InteractionsService],
})
export class InteractionsModule {}
