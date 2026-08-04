import { faker } from '@faker-js/faker';
import { Client } from 'src/client/entities/client.entity';
import { ClientStatus } from 'src/client/enums/client-status.enum';
import { DataSource } from 'typeorm';

export async function seedClients(
  dataSource: DataSource,
  amount = 20,
): Promise<Client[]> {
  const repo = dataSource.getRepository(Client);

  const clients: Client[] = [];

  for (let i = 0; i < amount; i++) {
    const client = repo.create({
      //   organization: faker.company.name(),

      organization: faker.helpers.arrayElement([
        'Concello de Lalín',
        'Concello de Monforte',
        'Concello de Sarria',
        'Pazo da Cultura de Pontevedra',
        'Auditorio Mar de Vigo',
        'Casa da Cultura de Xinzo',
        'Festival SonRías Baixas',
        'Festival de Maxia',
        'ANPA O Castro',
        'ANPA Monte da Guía',
        'Comisión de Festas de San Xoán',
        'Comisión de Festas do Carme',
      ]),

      subject: faker.helpers.arrayElement([
        '',
        'Programación cultural',
        'Campaña escolar',
        'Festival de verán',
        'Animación de Nadal',
        'Feira medieval',
        'Programación infantil',
        'Fiestas patronales',
        'Circuito cultural',
      ]),

      status: faker.helpers.arrayElement(Object.values(ClientStatus)),

      //   notes: faker.datatype.boolean() ? faker.lorem.sentences(2) : null,

      //   notes: faker.datatype.boolean()
      //     ? faker.lorem.paragraph()
      //     : null,

      notes: faker.helpers.arrayElement([
        '',
        '',
        '',
        'Solicita presupuesto para verano.',
        'Prefiere contacto por correo.',
        'Ya contrató en 2025.',
        'Pendiente de disponibilidad.',
        'Interesado en espectáculos familiares.',
        'Presupuesto limitado.',
        'Esperando respuesta del concejal.',
        'Llamar después de Semana Santa.',
        'Organiza programación anual.',
      ]),
    });

    clients.push(await repo.save(client));
  }

  console.log(`✔ ${clients.length} clientes`);

  return clients;
}
