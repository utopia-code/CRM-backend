import { Injectable } from '@nestjs/common';
import { Show } from 'src/catalog/entities/show.entity';
import { Client } from 'src/client/entities/client.entity';
import { Interaction } from 'src/interactions/entities/interaction.entity';
import { ScheduleEntry } from 'src/schedule/entities/schedule-entry.entity';
import { Task } from 'src/tasks/entities/task.entity';
import { DataSource } from 'typeorm';
import { BackupDto } from '../dto/backup.dto';

@Injectable()
export class ExportService {
  constructor(private readonly dataSource: DataSource) {}

  async export(): Promise<BackupDto> {
    const clientRepository = this.dataSource.getRepository(Client);

    const clients = await clientRepository.find({
      relations: {
        contacts: true,
      },
      withDeleted: true,
    });

    const showRepository = this.dataSource.getRepository(Show);

    const shows = await showRepository.find({
      withDeleted: true,
    });

    const taskRepository = this.dataSource.getRepository(Task);

    const tasks = await taskRepository.find({
      relations: {
        client: true,
      },
    });

    const interactionRepository = this.dataSource.getRepository(Interaction);

    const interactions = await interactionRepository.find({
      relations: {
        client: true,
        task: true,
        show: true,
        scheduleEntry: true,
      },
    });

    const scheduleRepository = this.dataSource.getRepository(ScheduleEntry);

    const scheduleEntries = await scheduleRepository.find({
      relations: {
        task: true,
        interaction: true,
      },
    });

    return {
      version: 1,

      createdAt: new Date().toISOString(),

      data: {
        clients: clients.map((client) => ({
          id: client.id,
          organization: client.organization,
          subject: client.subject ?? null,
          status: client.status,
          notes: client.notes ?? null,
          createdAt: client.createdAt.toISOString(),
          deletedAt: client.deletedAt ? client.deletedAt.toISOString() : null,
          contacts: (client.contacts ?? []).map((contact) => ({
            id: contact.id,
            name: contact.name,
            role: contact.role ?? null,
            email: contact.email ?? null,
            telephone: contact.telephone ?? null,
            createdAt: contact.createdAt.toISOString(),
            deletedAt: contact.deletedAt
              ? contact.deletedAt.toISOString()
              : null,
          })),
        })),

        shows: shows.map((show) => ({
          id: show.id,
          name: show.name,
          company: show.company,
          duration: show.duration,
          price: show.price,
          cost: show.cost ?? null,
          audience: show.audience ?? null,
          spaceType: show.spaceType ?? null,
          description: show.description ?? null,
          createdAt: show.createdAt.toISOString(),
          deletedAt: show.deletedAt ? show.deletedAt.toISOString() : null,
        })),

        tasks: tasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description ?? null,
          status: task.status,
          priority: task.priority,
          createdAt: task.createdAt.toISOString(),
          clientId: task.client ? task.client.id : null,
        })),

        interactions: interactions.map((interaction) => ({
          id: interaction.id,
          category: interaction.category,
          type: interaction.type,
          subject: interaction.subject,
          notes: interaction.notes ?? null,
          duration: interaction.duration ?? null,
          campaignResult: interaction.campaignResult,
          amount:
            interaction.amount !== null && interaction.amount !== undefined
              ? interaction.amount.toString()
              : null,
          status: interaction.status,
          clientId: interaction.client ? interaction.client.id : null,
          taskId: interaction.task ? interaction.task.id : null,
          scheduleEntryId: interaction.scheduleEntry
            ? interaction.scheduleEntry.id
            : null,
          showId: interaction.show ? interaction.show.id : null,
        })),

        scheduleEntries: scheduleEntries.map((entry) => ({
          id: entry.id,
          type: entry.type,
          title: entry.title ?? null,
          startDate: entry.startDate.toISOString(),
          endDate: entry.endDate ? entry.endDate.toISOString() : null,
          reminderDate: entry.reminderDate
            ? entry.reminderDate.toISOString()
            : null,
          reminderStatus: entry.reminderStatus,
          taskId: entry.task ? entry.task.id : null,
          interactionId: entry.interaction ? entry.interaction.id : null,
        })),
      },
    };
  }
}
