import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src/client/entities/client.entity';
import { Interaction } from 'src/interactions/entities/interaction.entity';
import { InteractionType } from 'src/interactions/enums/interaction-type.enum';
import { ScheduleEntry } from 'src/schedule/entities/schedule-entry.entity';
import { ReminderStatus } from 'src/schedule/enums/reminder-status.enum';
import { ScheduleType } from 'src/schedule/enums/schedule-type.enum';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CreateTaskDto } from './dtos/create-task.dto';
import { TaskDetailDto } from './dtos/task-detail.dto';
import { TaskListDto } from './dtos/task-list.dto';
import { TaskDto } from './dtos/task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,

    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,

    @InjectRepository(ScheduleEntry)
    private readonly scheduleEntryRepo: Repository<ScheduleEntry>,

    @InjectRepository(Interaction)
    private readonly interactionRepo: Repository<Interaction>,

    private readonly dataSource: DataSource,
  ) {}

  private async createTaskEntity(
    manager: EntityManager,
    taskData: TaskDto,
  ): Promise<Task> {
    const { clientId, ...data } = taskData;

    let client: Client | null = null;

    if (clientId) {
      client = await manager.findOneByOrFail(Client, {
        id: clientId,
      });
    }

    const task = manager.create(Task, {
      ...data,
      client,
    });

    return manager.save(task);
  }

  private async createScheduleEntry(
    manager: EntityManager,
    task: Task,
    endDate?: Date,
    reminderDate?: Date,
  ): Promise<ScheduleEntry> {
    const schedule = manager.create(ScheduleEntry, {
      type: ScheduleType.TASK,
      startDate: new Date(),
      endDate,
      reminderDate,
      reminderStatus: ReminderStatus.PENDING,
      task,
    });

    return manager.save(schedule);
  }

  async createTask(createTaskDto: CreateTaskDto) {
    return this.dataSource.transaction(async (manager) => {
      const { endDate, reminderDate, ...taskData } = createTaskDto;

      const task = await this.createTaskEntity(manager, taskData);

      if (endDate || reminderDate) {
        await this.createScheduleEntry(manager, task, endDate, reminderDate);
      }

      return manager.findOne(Task, {
        where: {
          id: task.id,
        },
        relations: {
          client: true,
          scheduleEntry: true,
        },
      });
    });
  }

  private async updateTaskEntity(
    manager: EntityManager,
    id: number,
    taskData: Omit<UpdateTaskDto, 'endDate' | 'reminderDate'>,
  ): Promise<Task> {
    const { clientId, ...data } = taskData;

    const task = await manager.findOne(Task, {
      where: { id },
      relations: {
        client: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    if (clientId !== undefined) {
      task.client =
        clientId === null
          ? null
          : await manager.findOneByOrFail(Client, { id: clientId });
    }

    Object.assign(task, data);

    return manager.save(task);
  }

  private async updateScheduleEntry(
    manager: EntityManager,
    task: Task,
    endDate?: Date | null,
    reminderDate?: Date | null,
  ): Promise<ScheduleEntry> {
    let scheduleEntry = await manager.findOne(ScheduleEntry, {
      where: {
        task: {
          id: task.id,
        },
      },
    });

    if (!scheduleEntry && !endDate && !reminderDate) {
      return null;
    }

    if (!scheduleEntry) {
      scheduleEntry = manager.create(ScheduleEntry, {
        type: ScheduleType.TASK,
        startDate: new Date(),
        reminderStatus: ReminderStatus.PENDING,
        task,
      });
    }

    if (endDate !== undefined) {
      scheduleEntry.endDate = endDate;
    }

    if (reminderDate !== undefined) {
      scheduleEntry.reminderDate = reminderDate;
      scheduleEntry.reminderStatus = ReminderStatus.PENDING;
    }

    return manager.save(scheduleEntry);
  }

  async updateTask(id: number, updateTaskDto: UpdateTaskDto) {
    return this.dataSource.transaction(async (manager) => {
      const { endDate, reminderDate, ...taskData } = updateTaskDto;

      const task = await this.updateTaskEntity(manager, id, taskData);

      await this.updateScheduleEntry(manager, task, endDate, reminderDate);

      return manager.findOne(Task, {
        where: { id: task.id },
        relations: {
          client: true,
          scheduleEntry: true,
        },
      });
    });
  }

  async findAll(include?: string) {
    const relations = include ? include.split(',') : [];

    return await this.taskRepo.find({
      relations,
    });
  }

  async findAllTasks(): Promise<TaskListDto[]> {
    const tasks = await this.taskRepo
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.client', 'client')
      .leftJoinAndSelect('task.scheduleEntry', 'scheduleEntry')
      .select([
        'task.id',
        'task.title',
        'task.status',
        'task.priority',

        'client.id',
        'client.organization',

        'scheduleEntry.endDate',
        'scheduleEntry.reminderDate',
      ])
      .orderBy('scheduleEntry.endDate', 'ASC')
      .getMany();

    //     .skip((page - 1) * limit)
    //     .take(limit)
    //     .getManyAndCount();

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,

      client: task.client
        ? {
            id: task.client.id,
            organization: task.client.organization,
          }
        : null,

      endDate: task.scheduleEntry?.endDate,
      reminderDate: task.scheduleEntry?.reminderDate,
    }));
  }

  async findOneTask(id: number): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: {
        client: true,
        scheduleEntry: true,
        interactions: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    return task;
  }

  async findOneTaskDetail(id: number): Promise<TaskDetailDto> {
    const task = await this.taskRepo
      .createQueryBuilder('task')
      .leftJoin('task.client', 'client')
      .leftJoin('task.scheduleEntry', 'scheduleEntry')
      .where('task.id = :id', { id })
      .select([
        'task.id',
        'task.title',
        'task.description',
        'task.status',
        'task.priority',

        'client.organization',

        'scheduleEntry.endDate',
        'scheduleEntry.reminderDate',
      ])
      .getOne();

    if (!task) {
      throw new NotFoundException('Tarefa non encontrada');
    }

    const interactions = await this.interactionRepo
      .createQueryBuilder('interaction')
      .select('COUNT(interaction.id)', 'total')
      .addSelect(
        `
      SUM(CASE WHEN interaction.type = :call THEN 1 ELSE 0 END)
    `,
        'calls',
      )
      .addSelect(
        `
      SUM(CASE WHEN interaction.type = :email THEN 1 ELSE 0 END)
    `,
        'emails',
      )
      .addSelect(
        `
      SUM(CASE WHEN interaction.type = :visit THEN 1 ELSE 0 END)
    `,
        'meetings',
      )
      .where('interaction.taskId = :id', { id })
      .setParameters({
        call: InteractionType.CALL,
        email: InteractionType.EMAIL,
        visit: InteractionType.MEETING,
      })
      .getRawOne();

    return {
      ...task,
      interactions: {
        total: Number(interactions.total),
        calls: Number(interactions.calls),
        emails: Number(interactions.emails),
        meetings: Number(interactions.meetings),
      },
    };
  }

  async removeTask(id: number): Promise<void> {
    const result = await this.taskRepo.delete(id);

    if (!result.affected) {
      throw new NotFoundException('Tarefa non encontrada');
    }
  }
}
