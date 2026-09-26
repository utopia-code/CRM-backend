import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

export class ClientTaskDto {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;

  client: {
    organization: string;
  } | null;

  scheduleEntry: {
    endDate: Date | null;
    reminderDate: Date | null;
  } | null;
}
