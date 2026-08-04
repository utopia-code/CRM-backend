import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { ScheduleEntry } from 'src/schedule/entities/schedule-entry.entity';

import { Interaction } from 'src/interactions/entities/interaction.entity';
import { ReminderStatus } from 'src/schedule/enums/reminder-status.enum';
import { ScheduleType } from 'src/schedule/enums/schedule-type.enum';
import { Task } from 'src/tasks/entities/task.entity';

export async function seedSchedule(
  dataSource: DataSource,
  tasks: Task[],
  interactions: Interaction[],
): Promise<ScheduleEntry[]> {
  const repo = dataSource.getRepository(ScheduleEntry);

  const schedules: ScheduleEntry[] = [];

  /*
   * TASKS
   *
   * Una tarea puede aparecer en agenda.
   * Si tiene reminderDate aparecerá también
   * en la campana de avisos.
   */
  for (const task of tasks) {
    // No todas las tareas necesitan fecha
    if (Math.random() > 0.6) {
      continue;
    }

    const startDate = faker.date.soon({
      days: 60,
    });

    const endDate = new Date(
      startDate.getTime() +
        faker.number.int({
          min: 30,
          max: 120,
        }) *
          60 *
          1000,
    );

    const hasReminder = Math.random() > 0.2;

    const schedule = repo.create({
      type: ScheduleType.TASK,
      title: task.title,
      startDate,
      endDate,
      reminderDate: hasReminder
        ? new Date(
            startDate.getTime() -
              faker.number.int({
                min: 2,
                max: 48,
              }) *
                60 *
                60 *
                1000,
          )
        : null,
      reminderStatus: hasReminder
        ? ReminderStatus.PENDING
        : ReminderStatus.COMPLETED,

      task,
    });

    schedules.push(await repo.save(schedule));
  }

  /*
   * INTERACTIONS
   *
   * Son acciones realizadas:
   * llamadas, emails, reuniones.
   *
   * No generan avisos.
   */
  for (const interaction of interactions) {
    if (Math.random() > 0.5) {
      continue;
    }

    const startDate = faker.date.recent({
      days: 60,
    });

    const endDate = new Date(
      startDate.getTime() +
        faker.number.int({
          min: 10,
          max: 90,
        }) *
          60 *
          1000,
    );

    const schedule = repo.create({
      type: ScheduleType.INTERACTION,
      title: interaction.subject,
      startDate,
      endDate,
      reminderDate: null,
      reminderStatus: ReminderStatus.COMPLETED,
      interaction,
    });

    schedules.push(await repo.save(schedule));
  }

  /*
   * EVENTS
   *
   * Eventos independientes:
   * actuaciones, festivales,
   * reuniones externas, ferias...
   *
   * No tienen task ni interaction.
   */
  const eventTitles = [
    'Actuación en Teatro Principal',
    'Festival de verano',
    'Presentación de temporada',
    'Feria cultural',
    'Reunión de programación',
    'Montaje de espectáculo',
    'Ensayo general',
    'Evento institucional',
  ];

  for (let i = 0; i < 25; i++) {
    const startDate = faker.date.soon({
      days: 120,
    });

    const hasEndDate = Math.random() > 0.15;

    const hasReminder = Math.random() > 0.35;

    const schedule = repo.create({
      type: ScheduleType.EVENT,
      title: faker.helpers.arrayElement(eventTitles),
      startDate,
      endDate: hasEndDate
        ? new Date(
            startDate.getTime() +
              faker.number.int({
                min: 1,
                max: 8,
              }) *
                60 *
                60 *
                1000,
          )
        : null,
      reminderDate: hasReminder
        ? new Date(
            startDate.getTime() -
              faker.number.int({
                min: 1,
                max: 72,
              }) *
                60 *
                60 *
                1000,
          )
        : null,
      reminderStatus: hasReminder
        ? ReminderStatus.PENDING
        : ReminderStatus.COMPLETED,
    });

    schedules.push(await repo.save(schedule));
  }

  console.log(`✔ ${schedules.length} anotaciones en la agenda`);

  return schedules;
}
