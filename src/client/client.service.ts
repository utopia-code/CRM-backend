import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientListDto } from './dtos/client-list.dto';
import { CreateClientDto } from './dtos/create-client.dto';
import { CreateContactDto } from './dtos/create-contact.dto';
import { UpdateClientDto } from './dtos/update-client.dto';
import { UpdateContactDto } from './dtos/update-contact.dto';
import { Client } from './entities/client.entity';
import { Contact } from './entities/contact.entity';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,

    @InjectRepository(Contact)
    private readonly contactRepo: Repository<Contact>,
  ) {}

  async createClient(createClientDto: CreateClientDto) {
    const client = this.clientRepo.create(createClientDto);
    return await this.clientRepo.save(client);
  }

  async createContact(clientId: number, createContactDto: CreateContactDto) {
    const client = await this.clientRepo.findOneBy({ id: clientId });

    if (!client) {
      throw new NotFoundException('Cliente non encontrado');
    }

    const contact = this.contactRepo.create({
      ...createContactDto,
      client,
    });

    return this.contactRepo.save(contact);
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

  async updateClient(id: number, updateClientDto: UpdateClientDto) {
    const result = await this.clientRepo.update(id, updateClientDto);

    if (result.affected === 0) {
      throw new NotFoundException('Cliente non encontrado');
    }

    return {
      success: true,
    };
  }

  async updateContact(id: number, updateContactDto: UpdateContactDto) {
    const result = await this.contactRepo.update(id, updateContactDto);

    if (result.affected === 0) {
      throw new NotFoundException('Contacto non encontrado');
    }

    return {
      success: true,
    };
  }

  async removeClient(id: number) {
    const client = await this.clientRepo.findOneBy({ id });

    if (!client) {
      throw new NotFoundException('Cliente non encontrado');
    }

    return await this.clientRepo.softDelete(id);
  }

  async removeContact(id: number) {
    const contact = await this.contactRepo.findOneBy({ id });

    if (!contact) {
      throw new NotFoundException('Contacto non encontrado');
    }

    return await this.contactRepo.softDelete(id);
  }

  /* Other options with merge and delete */

  // async update(id: number, updateContactDto: UpdateContactDto) {
  //   const contact = await this.contactRepo.findOneBy({ id });

  //   if (!contact) {
  //     throw new NotFoundException('Contacto non encontrado');
  //   }

  //   const updated = this.contactRepo.merge(contact, updateContactDto);

  //   return await this.contactRepo.save(updated);
  // }

  // async remove(id: number) {
  //   return await this.contactRepo.delete(id);
  // }
}
