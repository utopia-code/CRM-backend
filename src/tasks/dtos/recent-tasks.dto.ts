import { TaskStatus } from '../enums/task-status.enum';

export class RecentTasksDto {
  id: number;
  title: string;
  status: TaskStatus;
  endDate: Date | null;
}
