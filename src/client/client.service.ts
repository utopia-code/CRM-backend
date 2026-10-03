import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Interaction } from 'src/interactions/entities/interaction.entity';
import { InteractionType } from 'src/interactions/enums/interaction-type.enum';
import { Task } from 'src/tasks/entities/task.entity';
import { TaskStatus } from 'src/tasks/enums/task-status.enum';
import { DataSource, Repository } from 'typeorm';
import { ClientDetailDto } from './dtos/client-detail.dto';
import { ClientListDto } from './dtos/client-list.dto';
import { ClientNameDto } from './dtos/client-name.dto';
import { CreateClientDto } from './dtos/create-client.dto';
import { UpdateClientDto } from './dtos/update-client.dto';
import { Client } from './entities/client.entity';
import { Contact } from './entities/contact.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,

    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,

    @InjectRepository(Interaction)
    private readonly interactionRepo: Repository<Interaction>,

    @InjectRepository(Task)
    private readonly tasksRepo: Repository<Task>,

    private readonly dataSource: DataSource,
  ) {}

  async createClient(createClientDto: CreateClientDto) {
    return this.dataSource.transaction(async (manager) => {
      const { contacts = [], ...clientData } = createClientDto;
      const client = manager.create(Client, clientData);

      await manager.save(client);

      if (contacts.length) {
        const contactEntities = contacts.map((contact) =>
          manager.create(Contact, {
            ...contact,
            client,
          }),
        );

        await manager.save(contactEntities);
      }

      return manager.findOne(Client, {
        where: { id: client.id },
        relations: {
          contacts: true,
        },
      });
    });
  }

  async findLClientsList(): Promise<ClientListDto[]> {
    const clients = await this.clientRepo
      .createQueryBuilder('client')
      .leftJoinAndSelect('client.contacts', 'contact')
      .select([
        'client.id',
        'client.organization',
        'client.status',

        'contact.id',
        'contact.name',
        'contact.role',
        'contact.email',
        'contact.telephone',
      ])
      .loadRelationCountAndMap(
        'client.interactionsCount',
        'client.interactions',
      )
      .loadRelationCountAndMap('client.tasksCount', 'client.tasks')
      .orderBy('client.organization', 'ASC')
      .getMany();

    return clients.map((client) => ({
      id: client.id,
      organization: client.organization,
      status: client.status,
      contacts: client.contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        role: contact.role,
        email: contact.email,
        telephone: contact.telephone,
      })),
      interactionsCount: client.interactionsCount ?? 0,
      tasksCount: client.tasksCount ?? 0,
    }));
  }

  async findListOfOrganizations(): Promise<ClientNameDto[]> {
    const clients = await this.clientRepo
      .createQueryBuilder('client')
      .select(['client.id', 'client.organization'])
      .getMany();

    return clients.map((client) => ({
      id: client.id,
      organization: client.organization,
    }));
  }

  async findAll(include?: string) {
    const relations = include ? include.split(',') : [];

    return await this.clientRepo.find({
      relations,
    });
  }

  async findAllWithRelations() {
    return await this.clientRepo.find({
      relations: ['contacts', 'tasks', 'interactions'],
    });
  }

  async findOne(id: number) {
    const client = await this.clientRepo.findOne({
      where: { id },
      relations: ['contacts', 'tasks', 'interactions'],
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return client;
  }

  async getClient(id: number) {
    const client = await this.clientRepo.findOne({
      where: { id },
      relations: {
        contacts: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    return client;
  }

  async getClientData(id: number): Promise<ClientDetailDto> {
    const client = await this.clientRepo.findOne({
      where: { id },
      relations: {
        contacts: true,
      },
    });

    if (!client) {
      throw new NotFoundException('Cliente no encontrado');
    }

    const interactions = await this.interactionRepo
      .createQueryBuilder('interaction')
      .select('COUNT(interaction.id)', 'total')
      .addSelect(
        `
                SUM(CASE WHEN interaction.type = :call THEN 1 ELSE 0 END)
              `,
        'calls',
      )
      .addSelect(
        `
                SUM(CASE WHEN interaction.type = :email THEN 1 ELSE 0 END)
              `,
        'emails',
      )
      .addSelect(
        `
                SUM(CASE WHEN interaction.type = :visit THEN 1 ELSE 0 END)
              `,
        'meetings',
      )
      .where('interaction.clientId = :id', { id })
      .setParameters({
        call: InteractionType.CALL,
        email: InteractionType.EMAIL,
        visit: InteractionType.MEETING,
      })
      .getRawOne();

    const tasks = await this.tasksRepo
      .createQueryBuilder('task')
      .select(
        `
        SUM(CASE WHEN task.status = :done THEN 1 ELSE 0 END)
      `,
        'completedTasks',
      )
      .addSelect(
        `
        SUM(CASE WHEN task.status != :done THEN 1 ELSE 0 END)
      `,
        'pendingTasks',
      )
      .where('task.clientId = :clientId', { clientId: id })
      .setParameter('done', TaskStatus.DONE)
      .getRawOne();

    return {
      id: client.id,
      organization: client.organization,
      subject: client.subject ?? null,
      notes: client.notes,
      status: client.status,

      contacts: client.contacts.map((contact) => ({
        id: contact.id,
        name: contact.name,
        role: contact.role ?? null,
        email: contact.email ?? null,
        telephone: contact.telephone ?? null,
      })),

      summary: {
        calls: Number(interactions?.calls ?? 0),
        emails: Number(interactions?.emails ?? 0),
        meetings: Number(interactions?.visits ?? 0),
        completedTasks: Number(tasks?.completedTasks ?? 0),
        pendingTasks: Number(tasks?.pendingTasks ?? 0),
      },
    };
  }

  async updateClient(id: number, updateClientDto: UpdateClientDto) {
    return this.dataSource.transaction(async (manager) => {
      const { contacts, ...clientData } = updateClientDto;

      const client = await manager.findOne(Client, {
        where: { id },
        relations: {
          contacts: true,
        },
      });

      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }

      // Update data client
      Object.assign(client, clientData);
      await manager.save(client);

      // If contacts are empty, not updated
      if (contacts !== undefined) {
        const existingContacts = new Map(
          client.contacts.map((contact) => [contact.id, contact]),
        );

        const receivedIds = new Set(
          contacts
            .filter((contact) => contact.id != null)
            .map((contact) => contact.id!),
        );

        // Remove contacts deleted in form
        const contactsToDelete = client.contacts.filter(
          (contact) => !receivedIds.has(contact.id),
        );

        if (contactsToDelete.length) {
          await manager.delete(
            Contact,
            contactsToDelete.map((contact) => contact.id),
          );
        }

        const contactsToSave: Contact[] = [];

        for (const contactDto of contacts) {
          if (contactDto.id) {
            const contact = existingContacts.get(contactDto.id);

            if (contact) {
              Object.assign(contact, contactDto);
              contactsToSave.push(contact);
            }
          } else {
            contactsToSave.push(
              manager.create(Contact, {
                ...contactDto,
                client,
              }),
            );
          }
        }

        if (contactsToSave.length) {
          await manager.save(Contact, contactsToSave);
        }
      }

      return manager.findOne(Client, {
        where: { id: client.id },
        relations: {
          contacts: true,
        },
      });
    });
  }

  async removeClient(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const client = await manager.findOne(Client, {
        where: { id },
        relations: {
          contacts: true,
        },
      });

      if (!client) {
        throw new NotFoundException('Cliente no encontrado');
      }

      if (client.contacts.length) {
        await manager.softDelete(
          Contact,
          client.contacts.map((contact) => contact.id),
        );
      }

      await manager.softDelete(Client, id);

      return {
        message: 'Cliente eliminado correctamente',
      };
    });
  }
}
