import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { BackupDto } from '../dto/backup.dto';
import { restoreClients } from './restore-clients';
import { restoreInteractions } from './restore-interactions';
import { restoreScheduleEntries } from './restore-schedule';
import { restoreShows } from './restore-shows';
import { restoreTasks } from './restore-tasks';

@Injectable()
export class RestoreService {
  constructor(private readonly dataSource: DataSource) {}

  async restore(backup: BackupDto) {
    this.validateBackup(backup);

    return this.dataSource.transaction(async (manager) => {
      await this.clearDatabase(manager);

      await restoreClients(manager, backup.data.clients);
      await restoreShows(manager, backup.data.shows);
      await restoreTasks(manager, backup.data.tasks);
      await restoreInteractions(manager, backup.data.interactions);
      await restoreScheduleEntries(manager, backup.data.scheduleEntries);

      return {
        success: true,
      };
    });
  }

  private validateBackup(backup: BackupDto) {
    if (!backup) {
      throw new BadRequestException('No se ha recibido ningún backup');
    }

    if (backup.version !== 1) {
      throw new BadRequestException(
        `Versión de backup no soportada: ${backup.version}`,
      );
    }

    if (!backup.data) {
      throw new BadRequestException('El backup no contiene datos');
    }

    if (!Array.isArray(backup.data.clients)) {
      throw new BadRequestException('El backup de clientes no es válido');
    }

    if (!Array.isArray(backup.data.shows)) {
      throw new BadRequestException('El backup de shows no es válido');
    }

    if (!Array.isArray(backup.data.tasks)) {
      throw new BadRequestException('El backup de tareas no es válido');
    }

    if (!Array.isArray(backup.data.interactions)) {
      throw new BadRequestException('El backup de interacciones no es válido');
    }

    if (!Array.isArray(backup.data.scheduleEntries)) {
      throw new BadRequestException('El backup de agenda no es válido');
    }
  }

  private async clearDatabase(manager: EntityManager) {
    await manager.query(`
    TRUNCATE TABLE
      schedule_entry,
      interaction,
      task,
      contact,
      client,
      show
    RESTART IDENTITY CASCADE;
  `);
  }
}
