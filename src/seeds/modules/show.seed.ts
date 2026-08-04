import { faker } from '@faker-js/faker';
import { Show } from 'src/catalog/entities/show.entity';
import { DataSource } from 'typeorm';

export async function seedShows(
  dataSource: DataSource,
  amount = 15,
): Promise<Show[]> {
  const repo = dataSource.getRepository(Show);

  const shows: Show[] = [];

  const audiences = ['Infantil', 'Familiar', 'Adulto', 'Todos los públicos'];

  const spaces = ['Teatro', 'Auditorio', 'Calle', 'Exterior', 'Sala pequeña'];

  for (let i = 0; i < amount; i++) {
    const show = repo.create({
      name: faker.music.songName(),
      company: faker.company.name(),
      duration: faker.number.int({ min: 45, max: 120 }),
      price: faker.number.int({ min: 800, max: 6000 }),
      cost: faker.number.int({ min: 400, max: 4000 }),
      audience: faker.helpers.arrayElement(audiences),
      spaceType: faker.helpers.arrayElement(spaces),
      description: faker.lorem.sentences(2),
    });

    shows.push(await repo.save(show));
  }

  console.log(`✔ ${shows.length} shows`);

  return shows;
}
