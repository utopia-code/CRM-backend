import { EntityManager } from 'typeorm';

import { Client } from 'src/client/entities/client.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { TaskPriority } from 'src/tasks/enums/task-priority.enum';
import { TaskStatus } from 'src/tasks/enums/task-status.enum';

import { BackupTaskDto } from '../dto/backup-task.dto';

export async function restoreTasks(
  manager: EntityManager,
  tasks: BackupTaskDto[],
) {
  const taskRepository = manager.getRepository(Task);

  const taskEntities = tasks.map((task) =>
    taskRepository.create({
      id: task.id,
      title: task.title,
      description: task.description ?? null,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      createdAt: new Date(task.createdAt),
      client: task.clientId ? ({ id: task.clientId } as Client) : null,
    }),
  );

  if (taskEntities.length) {
    await taskRepository.save(taskEntities);
  }

  console.log(`✅ Restored ${taskEntities.length} tasks`);
}
