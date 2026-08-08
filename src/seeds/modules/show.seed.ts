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
      price: faker.number.float({
        min: 800,
        max: 6000,
        fractionDigits: 2,
      }),
      cost:
        faker.helpers.maybe(
          () =>
            faker.number.float({
              min: 400,
              max: 4000,
              fractionDigits: 2,
            }),
          { probability: 0.8 },
        ) ?? null,

      audience:
        faker.helpers.maybe(() => faker.helpers.arrayElement(audiences), {
          probability: 0.9,
        }) ?? null,

      spaceType:
        faker.helpers.maybe(() => faker.helpers.arrayElement(spaces), {
          probability: 0.9,
        }) ?? null,

      description:
        faker.helpers.maybe(() => faker.lorem.sentences(2), {
          probability: 0.8,
        }) ?? null,
    });

    shows.push(await repo.save(show));
  }

  console.log(`✔ ${shows.length} shows`);

  return shows;
}
