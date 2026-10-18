import { CampaignClient } from 'src/campaigns/entities/campaign-client.entity';
import { ScheduleEntry } from 'src/schedule/entities/schedule-entry.entity';
import {
  Column,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CampaignStatus } from '../enums/campaign-status.enum';

@Entity()
export class Campaign {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.PLANNED,
  })
  status: CampaignStatus;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @OneToMany(() => CampaignClient, (campaignClient) => campaignClient.campaign)
  campaignClients: CampaignClient[];

  @OneToOne(() => ScheduleEntry, (scheduleEntry) => scheduleEntry.campaign)
  scheduleEntry: ScheduleEntry | null;
}
