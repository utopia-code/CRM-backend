import { Client } from 'src/client/entities/client.entity';
import { Contact } from 'src/client/entities/contact.entity';
import { EntityManager } from 'typeorm';
import { BackupClientDto } from '../dto/backup-client.dto';

export async function restoreClients(
  manager: EntityManager,
  clients: BackupClientDto[],
) {
  const clientRepository = manager.getRepository(Client);
  const contactRepository = manager.getRepository(Contact);

  const clientEntities = clients.map((client) =>
    clientRepository.create({
      id: client.id,
      organization: client.organization,
      subject: client.subject ?? null,
      status: client.status,
      notes: client.notes ?? null,
      createdAt: new Date(client.createdAt),
      deletedAt: client.deletedAt ? new Date(client.deletedAt) : null,
    }),
  );

  await clientRepository.save(clientEntities);

  const contactEntities = clients.flatMap((client) =>
    (client.contacts ?? []).map((contact) =>
      contactRepository.create({
        id: contact.id,
        name: contact.name,
        role: contact.role ?? null,
        email: contact.email ?? null,
        telephone: contact.telephone ?? null,
        createdAt: new Date(contact.createdAt),
        deletedAt: contact.deletedAt ? new Date(contact.deletedAt) : null,

        client: { id: client.id } as Client,
      }),
    ),
  );

  if (contactEntities.length) {
    await contactRepository.save(contactEntities);
  }

  console.log(
    `✅ Restored ${clientEntities.length} clients and ${contactEntities.length} contacts`,
  );
}
