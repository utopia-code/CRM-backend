import { Show } from 'src/catalog/entities/show.entity';
import { Client } from 'src/client/entities/client.entity';
import { ScheduleEntry } from 'src/schedule/entities/schedule-entry.entity';
import { Task } from 'src/tasks/entities/task.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CampaignResult } from '../enums/campaign-result';
import { InteractionCategory } from '../enums/interaction-category.enum';
import { InteractionType } from '../enums/interaction-type.enum';
import { ProposalStatus } from '../enums/proposal-status.enum';

@Entity()
export class Interaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({
    type: 'enum',
    enum: InteractionCategory,
    default: InteractionCategory.GENERAL,
  })
  category: InteractionCategory;

  @Index()
  @Column({
    type: 'enum',
    enum: InteractionType,
    default: InteractionType.CALL,
  })
  type: InteractionType;

  @Column()
  subject: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ nullable: true })
  duration?: number;

  @Column({
    type: 'enum',
    enum: CampaignResult,
    default: CampaignResult.UNQUALIFIED,
  })
  campaingResult: CampaignResult;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  amount?: number;

  @Column({
    type: 'enum',
    enum: ProposalStatus,
    default: ProposalStatus.OPEN,
  })
  status: ProposalStatus;

  // RELATIONSHIP

  @Index()
  @ManyToOne(() => Client, (client) => client.interactions, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  client?: Client;

  @Index()
  @ManyToOne(() => Task, (task) => task.interactions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  task?: Task;

  @OneToOne(() => ScheduleEntry, (scheduleEntry) => scheduleEntry.interaction, {
    nullable: true,
  })
  scheduleEntry?: ScheduleEntry;

  @ManyToOne(() => Show, (show) => show.interaction, { nullable: true })
  @JoinColumn({ name: 'catalog_show_id' })
  show?: Show;
}
