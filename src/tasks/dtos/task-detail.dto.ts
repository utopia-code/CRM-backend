import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';

export class TaskDetailDto {
  id: number;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;

  client?: {
    organization: string;
  } | null;

  schedule?: {
    endDate?: Date;
    reminderDate?: Date;
  } | null;

  interactions?: {
    total: number;
    calls: number;
    emails: number;
    meetings: number;
  } | null;
}
