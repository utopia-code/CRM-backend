import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from 'src/client/entities/client.entity';
import { ScheduleEntry } from 'src/schedule/entities/schedule-entry.entity';
import { Task } from './entities/task.entity';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Client, ScheduleEntry])],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
