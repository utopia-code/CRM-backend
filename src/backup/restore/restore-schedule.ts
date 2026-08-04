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
      title: entry.title ?? null,
      startDate: new Date(entry.startDate),
      endDate: entry.endDate ? new Date(entry.endDate) : null,
      reminderDate: entry.reminderDate ? new Date(entry.reminderDate) : null,
      reminderStatus: entry.reminderStatus,
      task: entry.taskId ? ({ id: entry.taskId } as Task) : null,
      interaction: entry.interactionId
        ? ({ id: entry.interactionId } as Interaction)
        : null,
    }),
  );

  if (scheduleEntities.length) {
    await scheduleRepository.save(scheduleEntities);
  }

  console.log(`✅ Restored ${scheduleEntities.length} schedule entries`);
}
