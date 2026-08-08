import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Client } from './client.entity';

@Entity()
export class Contact {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  role: string | null;

  @Column({ nullable: true })
  email: string | null;

  @Column({ nullable: true })
  telephone: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // RELATIONSHIP

  @ManyToOne(() => Client, (client) => client.contacts, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  client: Client;
}
