import { DataSource } from 'typeorm';
import { seedClients } from './modules/client.seed';
import { seedContacts } from './modules/contact.seed';
import { seedInteractions } from './modules/interaction.seed';
import { seedSchedule } from './modules/schedule.seed';
import { seedShows } from './modules/show.seed';
import { seedTasks } from './modules/task.seed';

const tables = [
  'schedule_entry',
  'interaction',
  'task',
  'contact',
  'client',
  '"show"',
];

export async function runSeed(dataSource: DataSource) {
  await clearDatabase(dataSource);

  const shows = await seedShows(dataSource);

  const clients = await seedClients(dataSource);

  await seedContacts(dataSource, clients);

  const tasks = await seedTasks(dataSource, clients);

  const interactions = await seedInteractions(
    dataSource,
    clients,
    tasks,
    shows,
  );

  await seedSchedule(dataSource, tasks, interactions);
}

async function clearDatabase(dataSource: DataSource): Promise<void> {
  await dataSource.query(`
    TRUNCATE TABLE ${tables.join(', ')}
    RESTART IDENTITY CASCADE;
  `);

  console.log('🗑️ Base de datos limpiada');
}
