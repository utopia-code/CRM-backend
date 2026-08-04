import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';

import { Client } from 'src/client/entities/client.entity';
import { Contact } from 'src/client/entities/contact.entity';

export async function seedContacts(
  dataSource: DataSource,
  clients: Client[],
): Promise<Contact[]> {
  const repo = dataSource.getRepository(Contact);

  const contacts: Contact[] = [];

  for (const client of clients) {
    const amount = faker.number.int({
      min: 1,
      max: 4,
    });

    for (let i = 0; i < amount; i++) {
      const contact = repo.create({
        name: faker.person.fullName(),
        role: faker.person.jobTitle(),
        email: faker.internet.email(),
        telephone: faker.phone.number(),
        client,
      });

      contacts.push(await repo.save(contact));
    }
  }

  console.log(`✔ ${contacts.length} contactos`);

  return contacts;
}
