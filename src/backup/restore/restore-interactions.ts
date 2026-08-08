import { EntityManager } from 'typeorm';

import { Show } from 'src/catalog/entities/show.entity';
import { Client } from 'src/client/entities/client.entity';
import { Interaction } from 'src/interactions/entities/interaction.entity';
import { Task } from 'src/tasks/entities/task.entity';

import { BackupInteractionDto } from '../dto/backup-interaction.dto';

export async function restoreInteractions(
  manager: EntityManager,
  interactions: BackupInteractionDto[],
) {
  const interactionRepository = manager.getRepository(Interaction);

  const interactionEntities = interactions.map((interaction) =>
    interactionRepository.create({
      id: interaction.id,
      category: interaction.category,
      type: interaction.type,
      subject: interaction.subject,
      notes: interaction.notes,
      duration: interaction.duration,
      campaignResult: interaction.campaignResult,
      amount: interaction.amount != null ? Number(interaction.amount) : null,
      status: interaction.status,
      client:
        interaction.clientId != null
          ? ({ id: interaction.clientId } as Client)
          : null,

      task:
        interaction.taskId != null
          ? ({ id: interaction.taskId } as Task)
          : null,

      show:
        interaction.showId != null
          ? ({ id: interaction.showId } as Show)
          : null,
    }),
  );

  if (interactionEntities.length) {
    await interactionRepository.save(interactionEntities);
  }

  console.log(`✅ Restored ${interactionEntities.length} interactions`);
}
