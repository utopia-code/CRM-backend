import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Interaction } from 'src/interactions/entities/interaction.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { ClientController } from './client.controller';
import { ClientService } from './client.service';
import { Client } from './entities/client.entity';
import { Contact } from './entities/contact.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Client, Contact, Interaction, Task])],
  providers: [ClientService],
  controllers: [ClientController],
})
export class ClientModule {}
