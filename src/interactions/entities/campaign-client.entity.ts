import { Campaign } from 'src/campaigns/entities/campaign.entity';
import { Client } from 'src/client/entities/client.entity';
import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Interaction } from './interaction.entity';

@Entity()
@Unique(['campaign', 'client'])
export class CampaignClient {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @ManyToOne(() => Campaign, (campaign) => campaign.campaignClients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'campaign_id' })
  campaign: Campaign;

  @Index()
  @ManyToOne(() => Client, (client) => client.campaignClients, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'client_id' })
  client: Client;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Interaction, (interaction) => interaction.campaignClient)
  interactions: Interaction[];
}
