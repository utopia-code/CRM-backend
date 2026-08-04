import { EntityManager } from 'typeorm';

import { Show } from 'src/catalog/entities/show.entity';

import { BackupShowDto } from '../dto/backup-show.dto';

export async function restoreShows(
  manager: EntityManager,
  shows: BackupShowDto[],
) {
  const showRepository = manager.getRepository(Show);

  const showEntities = shows.map((show) =>
    showRepository.create({
      id: show.id,
      name: show.name,
      company: show.company,
      duration: show.duration,
      price: show.price,
      cost: show.cost ?? null,
      audience: show.audience ?? null,
      spaceType: show.spaceType ?? null,
      description: show.description ?? null,
      createdAt: new Date(show.createdAt),
      deletedAt: show.deletedAt ? new Date(show.deletedAt) : null,
    }),
  );

  if (showEntities.length) {
    await showRepository.save(showEntities);
  }

  console.log(`✅ Restored ${showEntities.length} shows`);
}
