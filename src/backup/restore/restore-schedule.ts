import { EntityManager } from 'typeorm';

import { Interaction } from 'src/interactions/entities/interaction.entity';
import { ScheduleEntry } from 'src/schedule/entities/schedule-entry.entity';
import { Task } from 'src/tasks/entities/task.entity';

import { BackupScheduleEntryDto } from '../dto/backup-schedule-entry.dto';

export async function restoreScheduleEntries(
  manager: EntityManager,
  scheduleEntries: BackupScheduleEntryDto[],
) {
  const scheduleRepository = manager.getRepository(ScheduleEntry);

  const scheduleEntities = scheduleEntries.map((entry) =>
    scheduleRepository.create({
      id: entry.id,
      type: entry.type,
      title: entry.title,
      startDate: new Date(entry.startDate),
      endDate: entry.endDate != null ? new Date(entry.endDate) : null,
      reminderDate:
        entry.reminderDate != null ? new Date(entry.reminderDate) : null,
      reminderStatus: entry.reminderStatus,
      task: entry.taskId != null ? ({ id: entry.taskId } as Task) : null,
      interaction:
        entry.interactionId != null
          ? ({ id: entry.interactionId } as Interaction)
          : null,
    }),
  );

  if (scheduleEntities.length) {
    await scheduleRepository.save(scheduleEntities);
  }

  console.log(`✅ Restored ${scheduleEntities.length} schedule entries`);
}
