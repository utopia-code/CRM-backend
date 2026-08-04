import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateScheduleEntryDto } from './dtos/create-schedule-entry.dto';
import { ScheduleEntry } from './entities/schedule-entry.entity';
import { ScheduleType } from './enums/schedule-type.enum';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(ScheduleEntry)
    private readonly scheduleEntryRepo: Repository<ScheduleEntry>,
  ) {}

  async create(createScheduleEntryDto: CreateScheduleEntryDto) {
    this.validateRelations(createScheduleEntryDto);

    const schedule = this.scheduleEntryRepo.create(createScheduleEntryDto);

    return this.scheduleEntryRepo.save(schedule);
  }

  // https://chatgpt.com/s/t_6a6e11b85b088191be3096c1007bf749
  private validateRelations(dto: CreateScheduleEntryDto) {
    switch (dto.type) {
      case ScheduleType.TASK:
        if (!dto.taskId) {
          throw new BadRequestException('TASK requires taskId');
        }

        if (dto.interactionId) {
          throw new BadRequestException('TASK cannot contain interactionId');
        }

        break;

      case ScheduleType.INTERACTION:
        if (!dto.interactionId) {
          throw new BadRequestException('INTERACTION requires interactionId');
        }

        if (dto.taskId) {
          throw new BadRequestException('INTERACTION cannot contain taskId');
        }

        break;

      case ScheduleType.EVENT:
        if (dto.taskId || dto.interactionId) {
          throw new BadRequestException('EVENT cannot contain relations');
        }

        break;
    }
  }
}
