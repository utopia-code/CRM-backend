import { Interaction } from 'src/interactions/entities/interaction.entity';
import { Task } from 'src/tasks/entities/task.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ScheduleType } from '../enums/schedule-type.enum';

@Entity()
export class ScheduleEntry {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({
    type: 'enum',
    enum: ScheduleType,
  })
  type: ScheduleType;

  @Column({ nullable: true })
  title?: string;

  @Index()
  @Column({ type: 'timestamp' })
  startDate: Date;

  @Index()
  @Column({ type: 'timestamp', nullable: true })
  endDate?: Date;

  @Index()
  @Column({ type: 'timestamp', nullable: true })
  reminderDate?: Date;

  @OneToOne(() => Task, (task) => task.scheduleEntry, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  task?: Task;

  @OneToOne(() => Interaction, (interaction) => interaction.scheduleEntry, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  interaction?: Interaction;
}
