import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from 'src/client/entities/client.entity';
import { Repository } from 'typeorm';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { Task } from './entities/task.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,

    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,
  ) {}

  async createTask(createTaskDto: CreateTaskDto) {
    const { clientId, ...taskData } = createTaskDto;

    let client: Client | null = null;

    if (clientId) {
      client = await this.clientRepo.findOneBy({ id: createTaskDto.clientId });

      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }
    }

    const task = this.taskRepo.create({
      ...taskData,
      client,
    });

    return this.taskRepo.save(task);
  }

  async findAllTasks(include?: string) {
    const relations = include ? include.split(',') : [];

    return await this.taskRepo.find({
      relations,
    });
  }

  async findOne(id: number) {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['client', 'events', 'interactions'],
    });

    if (!task) {
      throw new NotFoundException('Tarefa non encontrada');
    }

    return task;
  }

  // async findOne(id: number) {
  //   const task = await this.taskRepo
  //     .createQueryBuilder('task')
  //     .leftJoinAndSelect('task.client', 'client')
  //     .leftJoinAndSelect('task.events', 'events')
  //     .leftJoinAndSelect('task.interactions', 'interactions')
  //     .where('task.id = :id', { id })
  //     .getOne();

  //   if (!task) {
  //     throw new NotFoundException('Tarefa non encontrada');
  //   }

  //   return task;
  // }

  async updateTask(id: number, updateTaskDto: UpdateTaskDto) {
    const result = await this.taskRepo.update(id, updateTaskDto);

    if (result.affected === 0) {
      throw new NotFoundException('Tarefa non encontrada');
    }

    return {
      success: true,
    };
  }

  async removeTask(id: number) {
    return await this.taskRepo.delete(id);
  }

  // async removeTask(id: number) {
  //   const task = await this.taskRepo.findOneBy({ id });

  //   if (!task) {
  //     throw new NotFoundException('Tarefa non encontrada');
  //   }

  //   return await this.taskRepo.softDelete(id);
  // }
}
