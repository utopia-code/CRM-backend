import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientTaskDto } from './dtos/client-task.dto';
import { CreateTaskDto } from './dtos/create-task.dto';
import { UpdateTaskStatusDto } from './dtos/update-task-status.dto';
import { UpdateTaskDto } from './dtos/update-task.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly taskService: TasksService) {}

  @Post()
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.createTask(createTaskDto);
  }

  @Get('list')
  findAllTasks() {
    return this.taskService.findAllTasks();
  }

  @Get()
  findAll(@Query('include') include?: string) {
    return this.taskService.findAll(include);
  }

  @Get(':id')
  findOneTask(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.findOneTaskDetail(id);
  }

  @Get('client/:clientId')
  findTasksByClient(
    @Param('clientId', ParseIntPipe) clientId: number,
  ): Promise<ClientTaskDto[]> {
    return this.taskService.findTasksByClient(clientId);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(id, updateTaskDto);
  }

  @Delete(':id')
  removeTask(@Param('id', ParseIntPipe) id: number) {
    return this.taskService.removeTask(id);
  }

  @Patch(':id/status')
  updateTaskStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTaskStatusDto: UpdateTaskStatusDto,
  ) {
    return this.taskService.updateTaskStatus(id, updateTaskStatusDto.status);
  }
}
