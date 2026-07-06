import { Interaction } from 'src/interactions/entities/interaction.entity';
import { Task } from 'src/tasks/entities/task.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClientStatus } from '../enums/client-status.enum';
import { Contact } from './contact.entity';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  organization: string;

  @Column({ nullable: true })
  subject: string;

  @Column({
    type: 'enum',
    enum: ClientStatus,
    default: ClientStatus.POTENTIAL,
  })
  status: ClientStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // RELATIONSHIP

  @OneToMany(() => Contact, (contact) => contact.client)
  contacts: Contact[];

  @OneToMany(() => Task, (task) => task.client)
  tasks: Task[];

  @OneToMany(() => Interaction, (interaction) => interaction.client)
  interactions: Interaction[];
}
