import { EntityManager } from 'typeorm';

import { Client } from 'src/client/entities/client.entity';
import { Task } from 'src/tasks/entities/task.entity';

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
      description: task.description,
      status: task.status,
      priority: task.priority,
      createdAt: new Date(task.createdAt),
      client: task.clientId != null ? ({ id: task.clientId } as Client) : null,
    }),
  );

  if (taskEntities.length) {
    await taskRepository.save(taskEntities);
  }

  console.log(`✅ Restored ${taskEntities.length} tasks`);
}
