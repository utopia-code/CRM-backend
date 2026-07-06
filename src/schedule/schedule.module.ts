import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleEntry } from './entities/schedule-entry.entity';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';

@Module({
  imports: [TypeOrmModule.forFeature([ScheduleEntry])],
  providers: [ScheduleService],
  controllers: [ScheduleController],
})
export class ScheduleModule {}
