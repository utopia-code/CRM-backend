import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Client } from 'src/client/entities/client.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { TaskPriority } from 'src/tasks/enums/task-priority.enum';
import { TaskStatus } from 'src/tasks/enums/task-status.enum';

export async function seedTasks(
  dataSource: DataSource,
  clients: Client[],
  amount = 80,
): Promise<Task[]> {
  const repo = dataSource.getRepository(Task);

  const tasks: Task[] = [];

  for (let i = 0; i < amount; i++) {
    const task = repo.create({
      title: faker.helpers.arrayElement([
        'Enviar presupuesto',
        'Llamar al cliente',
        'Preparar propuesta',
        'Enviar dossier',
        'Confirmar disponibilidad',
        'Solicitar documentación',
        'Concertar reunión',
        'Actualizar CRM',
        'Revisar contrato',
        'Enviar factura',
        'Solicitar caché',
        'Confirmar horario montaje',
        'Reservar fecha',
      ]),

      //   description: faker.lorem.sentences(2),

      description: faker.helpers.arrayElement([
        '',
        'Pendiente de respuesta.',
        'Enviar esta semana.',
        'Esperando confirmación.',
        'Hablar con producción.',
        'Consultar disponibilidad.',
        'Confirmar presupuesto.',
      ]),

      status: faker.helpers.arrayElement(Object.values(TaskStatus)),

      priority: faker.helpers.arrayElement(Object.values(TaskPriority)),

      client: faker.datatype.boolean()
        ? faker.helpers.arrayElement(clients)
        : null,
    });

    tasks.push(await repo.save(task));
  }

  console.log(`✔ ${tasks.length} tareas`);

  return tasks;
}
