import { DataSource } from 'typeorm';

import { Client } from 'src/client/entities/client.entity';
import { Contact } from 'src/client/entities/contact.entity';
import { ClientStatus } from 'src/client/enums/client-status.enum';
import clientsData from './data/clients.json';

export async function seedClients(dataSource: DataSource) {
  const clientRepository = dataSource.getRepository(Client);
  const contactRepository = dataSource.getRepository(Contact);

  for (const item of clientsData) {
    const exists = await clientRepository.findOne({
      where: { organization: item.organization },
    });

    if (exists) {
      console.log(`⏩ Skipping: ${item.organization}`);
      continue;
    }

    const client = clientRepository.create({
      organization: item.organization,
      subject: item.subject || '',
      status: item.status as ClientStatus,
      notes: item.notes || '',
      createdAt: new Date(item.createdAt),
    });

    const saveClient = await clientRepository.save(client);

    for (const c of item.contacts || []) {
      const contact = contactRepository.create({
        name: c.name,
        role: c.role || '',
        email: c.email || '',
        telephone: c.telephone || '',
        createdAt: new Date(c.createdAt),
        client: saveClient,
      });

      await contactRepository.save(contact);
    }
  }

  console.log('✅ Clients seeded successfully');
}

// import { readFileSync } from 'fs';
// import { join } from 'path';
// import { DataSource } from 'typeorm';

// import { Client } from 'src/client/entities/client.entity';
// import { Contact } from 'src/client/entities/contact.entity';

// export async function seedClients(dataSource: DataSource) {
//   const clientRepository = dataSource.getRepository(Client);

//   const contactRepository = dataSource.getRepository(Contact);

//   const file = readFileSync(join(__dirname, 'data', 'clients.json'), 'utf8');

//   const clients = JSON.parse(file);

//   for (const item of clients) {
//     const client = clientRepository.create({
//       organization: item.organization,

//       subject: item.subject,

//       status: item.status,

//       notes: item.notes,

//       createdAt: new Date(item.createdAt),
//     });

//     await clientRepository.save(client);

//     for (const c of item.contacts) {
//       const contact = contactRepository.create({
//         name: c.name,

//         role: c.role,

//         email: c.email,

//         telephone: c.telephone,

//         createdAt: new Date(c.createdAt),

//         client,
//       });

//       await contactRepository.save(contact);
//     }
//   }

//   console.log('Clientes importados');
// }
