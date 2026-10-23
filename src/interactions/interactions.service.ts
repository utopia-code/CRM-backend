import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Show } from 'src/catalog/entities/show.entity';
import { Client } from 'src/client/entities/client.entity';
import { ScheduleEntry } from 'src/schedule/entities/schedule-entry.entity';
import { ScheduleType } from 'src/schedule/enums/schedule-type.enum';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CampaignClient } from '../campaigns/entities/campaign-client.entity';
import { ClientProposalDto } from './dtos/client-proposal.dto';
import { CreateCampaignInteractionDto } from './dtos/create-campaign-interaction.dto';
import { CreateInteractionDto } from './dtos/create-interaction.dto';
import { CreateProposalInteractionDto } from './dtos/create-proposal-interaction.dto';
import { InteractionCampaignDto } from './dtos/interaction-campaign.dto';
import { InteractionProposalDto } from './dtos/interaction-proposal.dto';
import { InteractionDto } from './dtos/interaction.dto';
import { RecentInteractionDto } from './dtos/recent-interaction.dto';
import { UpdateCampaignInteractionDto } from './dtos/update-campaign-interaction.dto';
import { UpdateInteractionDto } from './dtos/update-interaction.dto';
import { UpdateProposalInteractionDto } from './dtos/update-proposal-interaction.dto';
import { WeeklyInteractionSummaryDto } from './dtos/weeklyInteraction-summary.dto';
import { Interaction } from './entities/interaction.entity';
import { InteractionCategory } from './enums/interaction-category.enum';
import { InteractionType } from './enums/interaction-type.enum';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(Interaction)
    private readonly interactionRepo: Repository<Interaction>,

    private readonly dataSource: DataSource,
  ) {}

  async findRecentInteractions(): Promise<RecentInteractionDto[]> {
    const rows = await this.interactionRepo
      .createQueryBuilder('interaction')
      .innerJoin('interaction.scheduleEntry', 'schedule')
      .leftJoin('interaction.client', 'client')
      .select('interaction.id', 'id')
      .addSelect('interaction.type', 'type')
      .addSelect('interaction.category', 'category')
      .addSelect('interaction.subject', 'subject')
      .addSelect('schedule.startDate', 'startDate')
      .addSelect('client.organization', 'organization')
      .orderBy('schedule.startDate', 'DESC')
      .addOrderBy('interaction.id', 'DESC')
      .limit(15)
      .getRawMany();

    return rows.map((row) => ({
      id: Number(row.id),
      type: row.type,
      category: row.category,
      subject: row.subject,
      startDate: new Date(row.startDate),
      organization: row.organization ?? null,
    }));
  }

  async getWeeklyInteractionSummary(): Promise<WeeklyInteractionSummaryDto> {
    const row = await this.interactionRepo
      .createQueryBuilder('interaction')
      .innerJoin('interaction.scheduleEntry', 'schedule')
      .select(
        `COUNT(*) FILTER (
        WHERE interaction.type = :call
      )`,
        'call',
      )
      .addSelect(
        `COUNT(*) FILTER (
        WHERE interaction.type = :email
      )`,
        'email',
      )
      .addSelect(
        `COUNT(*) FILTER (
        WHERE interaction.type = :meeting
      )`,
        'meeting',
      )
      .where(
        'schedule.startDate >= :fromDate AND schedule.startDate <= :toDate',
        {
          fromDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          toDate: new Date(),
        },
      )
      .setParameters({
        call: InteractionType.CALL,
        email: InteractionType.EMAIL,
        meeting: InteractionType.MEETING,
      })
      .getRawOne();

    return {
      call: Number(row.call),
      email: Number(row.email),
      meeting: Number(row.meeting),
    };
  }

  async findClientInteractions(clientId: number): Promise<InteractionDto[]> {
    const rows = await this.interactionRepo
      .createQueryBuilder('interaction')
      .innerJoin('interaction.scheduleEntry', 'schedule')
      .select('interaction.id', 'id')
      .addSelect('interaction.type', 'type')
      .addSelect('interaction.category', 'category')
      .addSelect('interaction.subject', 'subject')
      .addSelect('interaction.notes', 'notes')
      .addSelect('interaction.duration', 'duration')
      .addSelect('schedule.startDate', 'startDate')
      .where('interaction.client_id = :clientId', { clientId })
      // .andWhere('interaction.category != :proposal', {
      //   proposal: InteractionCategory.PROPOSAL,
      // })
      // // .andWhere('interaction.category = :category', {
      //   category: InteractionCategory.GENERAL,
      // })
      .orderBy('schedule.startDate', 'DESC')
      .addOrderBy('interaction.id', 'DESC')
      .getRawMany();

    return rows.map((row) => ({
      id: Number(row.id),
      type: row.type,
      category: row.category,
      subject: row.subject,
      startDate: new Date(row.startDate),
      notes: row.notes ?? null,
      duration: row.duration == null ? null : Number(row.duration),
    }));
  }

  async findClientProposals(clientId: number): Promise<ClientProposalDto[]> {
    const rows = await this.interactionRepo
      .createQueryBuilder('interaction')
      .innerJoin('interaction.scheduleEntry', 'schedule')
      .leftJoin('interaction.show', 'show')
      .select('interaction.id', 'id')
      .addSelect('interaction.type', 'type')
      .addSelect('interaction.category', 'category')
      .addSelect('interaction.subject', 'subject')
      .addSelect('interaction.notes', 'notes')
      .addSelect('interaction.duration', 'duration')
      .addSelect('interaction.amount', 'amount')
      .addSelect('interaction.proposalStatus', 'proposalStatus')
      .addSelect('schedule.startDate', 'startDate')
      .addSelect('show.name', 'show')
      .where('interaction.client_id = :clientId', { clientId })
      .andWhere('interaction.category = :category', {
        category: InteractionCategory.PROPOSAL,
      })
      .orderBy('schedule.startDate', 'DESC')
      .addOrderBy('interaction.id', 'DESC')
      .getRawMany();

    return rows.map((row) => ({
      id: Number(row.id),
      type: row.type,
      category: row.category,
      subject: row.subject,
      notes: row.notes ?? null,
      duration: row.duration == null ? null : Number(row.duration),
      amount: row.amount == null ? null : Number(row.amount),
      proposalStatus: row.proposalStatus,
      show: row.show ?? null,
      startDate: new Date(row.startDate),
    }));
  }

  private async findClientOrFail(
    manager: EntityManager,
    clientId: number,
  ): Promise<Client> {
    const client = await manager.getRepository(Client).findOne({
      where: { id: clientId },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return client;
  }

  private async createInteractionSchedule(
    manager: EntityManager,
    interaction: Interaction,
    startDate: string,
    type: ScheduleType,
  ): Promise<ScheduleEntry> {
    const schedule = manager.create(ScheduleEntry, {
      startDate: new Date(startDate),
      interaction,
      type,
    });

    return manager.save(schedule);
  }

  async createInteraction(dto: CreateInteractionDto): Promise<InteractionDto> {
    return this.dataSource.transaction(async (manager) => {
      const client = await this.findClientOrFail(manager, dto.clientId);

      const interaction = manager.create(Interaction, {
        client,
        type: dto.type,
        category: InteractionCategory.GENERAL,
        subject: dto.subject,
        notes: dto.notes ?? null,
        duration: dto.duration ?? null,
      });

      const savedInteraction = await manager.save(interaction);

      const schedule = await this.createInteractionSchedule(
        manager,
        savedInteraction,
        dto.startDate,
        ScheduleType.INTERACTION,
      );

      return {
        id: savedInteraction.id,
        type: savedInteraction.type,
        category: savedInteraction.category,
        subject: savedInteraction.subject,
        notes: savedInteraction.notes ?? null,
        duration: savedInteraction.duration ?? null,
        startDate: new Date(schedule.startDate),
      };
    });
  }

  async createCampaignInteraction(
    dto: CreateCampaignInteractionDto,
  ): Promise<InteractionCampaignDto> {
    return this.dataSource.transaction(async (manager) => {
      const client = await this.findClientOrFail(manager, dto.clientId);

      const campaignClient = await manager
        .getRepository(CampaignClient)
        .findOne({
          where: { id: dto.campaignClientId },
          relations: { client: true },
        });

      if (!campaignClient) {
        throw new NotFoundException('Campaign client not found');
      }

      if (campaignClient.client.id !== client.id) {
        throw new BadRequestException(
          'Campaign client does not belong to the specified client',
        );
      }

      const interaction = manager.create(Interaction, {
        client,
        campaignClient,
        type: dto.type,
        category: InteractionCategory.CAMPAIGN,
        subject: dto.subject,
        notes: dto.notes ?? null,
        duration: dto.duration ?? null,
        campaignResult: dto.campaignResult,
      });

      const savedCampaign = await manager.save(Interaction, interaction);

      const schedule = await this.createInteractionSchedule(
        manager,
        savedCampaign,
        dto.startDate,
        ScheduleType.CAMPAIGN,
      );

      return {
        id: savedCampaign.id,
        type: savedCampaign.type,
        category: savedCampaign.category,
        subject: savedCampaign.subject,
        notes: savedCampaign.notes ?? null,
        duration: savedCampaign.duration ?? null,
        startDate: schedule.startDate,
        campaignResult: savedCampaign.campaignResult,
        campaignClientId: campaignClient.id,
      };
    });
  }

  async createProposalInteraction(
    dto: CreateProposalInteractionDto,
  ): Promise<InteractionProposalDto> {
    return this.dataSource.transaction(async (manager) => {
      const client = await this.findClientOrFail(manager, dto.clientId);

      let show: Show | null = null;

      if (dto.showId != null) {
        show = await manager.getRepository(Show).findOne({
          where: { id: dto.showId },
        });

        if (!show) {
          throw new NotFoundException('Show not found');
        }
      }

      const interaction = manager.create(Interaction, {
        client,
        show,
        type: dto.type,
        category: InteractionCategory.PROPOSAL,
        subject: dto.subject,
        notes: dto.notes ?? null,
        duration: dto.duration ?? null,
        amount: dto.amount ?? null,
        proposalStatus: dto.proposalStatus,
      });

      const savedProposal = await manager.save(interaction);

      const schedule = await this.createInteractionSchedule(
        manager,
        savedProposal,
        dto.startDate,
        ScheduleType.INTERACTION,
      );

      return {
        id: savedProposal.id,
        type: savedProposal.type,
        category: savedProposal.category,
        subject: savedProposal.subject,
        notes: savedProposal.notes ?? null,
        duration: savedProposal.duration ?? null,
        startDate: schedule.startDate,
        amount:
          savedProposal.amount == null ? null : Number(savedProposal.amount),
        proposalStatus: savedProposal.proposalStatus,
        showId: show?.id ?? null,
        showName: show?.name ?? null,
      };
    });
  }

  private async findInteractionOrFail(
    manager: EntityManager,
    id: number,
    category?: InteractionCategory,
  ): Promise<Interaction> {
    const interaction = await manager.getRepository(Interaction).findOne({
      where: { id },
      relations: {
        client: true,
        campaignClient: { client: true },
        show: true,
      },
    });

    if (!interaction) {
      throw new NotFoundException('Interaction not found');
    }

    if (category !== undefined && interaction.category !== category) {
      throw new BadRequestException(
        `Interaction is not a ${category} interaction`,
      );
    }

    return interaction;
  }

  private async updateCommonFields(
    manager: EntityManager,
    interaction: Interaction,
    dto: UpdateInteractionDto,
  ): Promise<ScheduleEntry> {
    if (dto.clientId !== undefined) {
      interaction.client = await this.findClientOrFail(manager, dto.clientId);
    }

    if (dto.type !== undefined) interaction.type = dto.type;
    if (dto.subject !== undefined) interaction.subject = dto.subject;
    if (dto.notes !== undefined) interaction.notes = dto.notes;
    if (dto.duration !== undefined) interaction.duration = dto.duration;

    const schedule = await manager.getRepository(ScheduleEntry).findOne({
      where: { interaction: { id: interaction.id } },
    });

    if (!schedule) {
      throw new NotFoundException('Schedule entry not found');
    }

    if (dto.startDate !== undefined) {
      schedule.startDate = new Date(dto.startDate);
      await manager.save(ScheduleEntry, schedule);
    }

    return schedule;
  }

  async updateInteraction(
    id: number,
    dto: UpdateInteractionDto,
  ): Promise<InteractionDto> {
    return this.dataSource.transaction(async (manager) => {
      const interaction = await this.findInteractionOrFail(
        manager,
        id,
        InteractionCategory.GENERAL,
      );

      const schedule = await this.updateCommonFields(manager, interaction, dto);

      const savedInteraction = await manager.save(Interaction, interaction);

      return {
        id: savedInteraction.id,
        type: savedInteraction.type,
        category: savedInteraction.category,
        subject: savedInteraction.subject,
        notes: savedInteraction.notes ?? null,
        duration: savedInteraction.duration ?? null,
        startDate: new Date(schedule.startDate),
      };
    });
  }

  async updateCampaignInteraction(
    id: number,
    dto: UpdateCampaignInteractionDto,
  ): Promise<InteractionCampaignDto> {
    return this.dataSource.transaction(async (manager) => {
      const interaction = await this.findInteractionOrFail(
        manager,
        id,
        InteractionCategory.CAMPAIGN,
      );

      const schedule = await this.updateCommonFields(manager, interaction, dto);

      if (dto.campaignResult !== undefined) {
        interaction.campaignResult = dto.campaignResult;
      }

      if (dto.campaignClientId !== undefined) {
        const campaignClient = await manager
          .getRepository(CampaignClient)
          .findOne({
            where: { id: dto.campaignClientId },
            relations: { client: true },
          });

        if (!campaignClient) {
          throw new NotFoundException('Campaign client not found');
        }

        const effectiveClientId = interaction.client?.id;

        if (
          effectiveClientId !== undefined &&
          campaignClient.client.id !== effectiveClientId
        ) {
          throw new BadRequestException(
            'Campaign client does not belong to the specified client',
          );
        }

        interaction.campaignClient = campaignClient;
      }

      const savedCampaign = await manager.save(Interaction, interaction);

      return {
        id: savedCampaign.id,
        type: savedCampaign.type,
        category: savedCampaign.category,
        subject: savedCampaign.subject,
        notes: savedCampaign.notes ?? null,
        duration: savedCampaign.duration ?? null,
        startDate: new Date(schedule.startDate),
        campaignResult: savedCampaign.campaignResult,
        campaignClientId: savedCampaign.campaignClient?.id ?? null,
      };
    });
  }

  async updateProposalInteraction(
    id: number,
    dto: UpdateProposalInteractionDto,
  ): Promise<InteractionProposalDto> {
    return this.dataSource.transaction(async (manager) => {
      const interaction = await this.findInteractionOrFail(
        manager,
        id,
        InteractionCategory.PROPOSAL,
      );

      const schedule = await this.updateCommonFields(manager, interaction, dto);

      if (dto.amount !== undefined) {
        interaction.amount = dto.amount;
      }

      if (dto.proposalStatus !== undefined) {
        interaction.proposalStatus = dto.proposalStatus;
      }

      if (dto.showId !== undefined) {
        if (dto.showId === null) {
          interaction.show = null;
        } else {
          const show = await manager.getRepository(Show).findOne({
            where: { id: dto.showId },
          });

          if (!show) {
            throw new NotFoundException('Show not found');
          }

          interaction.show = show;
        }
      }

      const savedProposal = await manager.save(Interaction, interaction);

      return {
        id: savedProposal.id,
        type: savedProposal.type,
        category: savedProposal.category,
        subject: savedProposal.subject,
        notes: savedProposal.notes ?? null,
        duration: savedProposal.duration ?? null,
        startDate: new Date(schedule.startDate),
        amount:
          savedProposal.amount == null ? null : Number(savedProposal.amount),
        proposalStatus: savedProposal.proposalStatus,
        showId: savedProposal.show?.id ?? null,
        showName: savedProposal.show?.name ?? null,
      };
    });
  }

  async removeInteraction(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const interaction = await manager.getRepository(Interaction).findOne({
        where: { id },
        select: { id: true },
      });

      if (!interaction) {
        throw new NotFoundException('Interaction not found');
      }

      await manager.getRepository(ScheduleEntry).delete({
        interaction: { id: interaction.id },
      });

      await manager.getRepository(Interaction).delete({
        id: interaction.id,
      });
    });
  }
}
