import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Show } from 'src/catalog/entities/show.entity';
import { Client } from 'src/client/entities/client.entity';
import { Interaction } from 'src/interactions/entities/interaction.entity';
import { CampaignResult } from 'src/interactions/enums/campaign-result';
import { InteractionCategory } from 'src/interactions/enums/interaction-category.enum';
import { InteractionType } from 'src/interactions/enums/interaction-type.enum';
import { ProposalStatus } from 'src/interactions/enums/proposal-status.enum';
import { Task } from 'src/tasks/entities/task.entity';

export async function seedInteractions(
  dataSource: DataSource,
  clients: Client[],
  tasks: Task[],
  shows: Show[],
  amount = 120,
): Promise<Interaction[]> {
  const repo = dataSource.getRepository(Interaction);

  const interactions: Interaction[] = [];

  for (let i = 0; i < amount; i++) {
    const interaction = repo.create({
      category: faker.helpers.arrayElement(Object.values(InteractionCategory)),

      type: faker.helpers.arrayElement(Object.values(InteractionType)),

      //   subject: faker.lorem.words(5),

      subject: faker.helpers.arrayElement([
        'Primera llamada',
        'Envío de presupuesto',
        'Reunión presencial',
        'Seguimiento comercial',
        'Presentación de espectáculos',
        'Negociación económica',
        'Confirmación de contratación',
        'Llamada de seguimiento',
        'Consulta sobre disponibilidad',
      ]),

      //   notes: faker.lorem.paragraph(),

      notes: faker.helpers.arrayElement([
        'Muy interesados.',
        'Llamar la próxima semana.',
        'Esperando decisión del pleno.',
        'Enviar catálogo actualizado.',
        'Solicitan propuesta económica.',
        'Posible contratación.',
      ]),

      duration: faker.number.int({
        min: 5,
        max: 120,
      }),

      campaignResult: faker.helpers.arrayElement(Object.values(CampaignResult)),

      amount: faker.number.float({
        min: 500,
        max: 6000,
        fractionDigits: 2,
      }),

      status: faker.helpers.arrayElement(Object.values(ProposalStatus)),

      client: faker.helpers.arrayElement(clients),

      task: faker.helpers.maybe(() => faker.helpers.arrayElement(tasks), {
        probability: 0.35,
      }),

      show: faker.helpers.maybe(() => faker.helpers.arrayElement(shows), {
        probability: 0.5,
      }),
    });

    interactions.push(await repo.save(interaction));
  }

  console.log(`✔ ${interactions.length} interacciones`);

  return interactions;
}
