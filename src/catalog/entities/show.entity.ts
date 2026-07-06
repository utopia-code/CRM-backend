import { Interaction } from 'src/interactions/entities/interaction.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Show {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  company: string;

  @Column()
  duration: number;

  @Column()
  price: number;

  @Column({ nullable: true })
  cost: number;

  @Column({ nullable: true })
  audience: string;

  @Column({ nullable: true })
  spaceType: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  // RELATIONSHIP

  @OneToMany(() => Interaction, (interaction) => interaction.show)
  interaction: Interaction[];
}
