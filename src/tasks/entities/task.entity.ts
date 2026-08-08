import { Client } from 'src/client/entities/client.entity';
import { Interaction } from 'src/interactions/entities/interaction.entity';
import { ScheduleEntry } from 'src/schedule/entities/schedule-entry.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Index()
  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @CreateDateColumn()
  createdAt: Date;

  // RELATIONSHIP

  @Index()
  @ManyToOne(() => Client, (client) => client.tasks, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  client?: Client | null;

  @OneToOne(() => ScheduleEntry, (scheduleEntry) => scheduleEntry.task)
  scheduleEntry: ScheduleEntry | null;

  @OneToMany(() => Interaction, (interaction) => interaction.task)
  interactions: Interaction[];
}
