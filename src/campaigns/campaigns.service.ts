import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CampaignClient } from 'src/campaigns/entities/campaign-client.entity';
import { Client } from 'src/client/entities/client.entity';
import { Interaction } from 'src/interactions/entities/interaction.entity';
import { CampaignResult } from 'src/interactions/enums/campaign-result';
import { InteractionType } from 'src/interactions/enums/interaction-type.enum';
import { ScheduleEntry } from 'src/schedule/entities/schedule-entry.entity';
import { ScheduleType } from 'src/schedule/enums/schedule-type.enum';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CampaignDetailDto } from './dto/campaign-detail-dto';
import { CampaignListDto } from './dto/campaign-list-dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';
import { Campaign } from './entities/campaign.entity';

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private readonly campaignRepo: Repository<Campaign>,

    @InjectRepository(ScheduleEntry)
    private readonly scheduleEntryRepo: Repository<ScheduleEntry>,

    private readonly dataSource: DataSource,
  ) {}

  private async createCampaignEntity(
    manager: EntityManager,
    campaignData: Omit<CreateCampaignDto, 'startDate' | 'endDate'>,
  ): Promise<Campaign> {
    const campaign = manager.create(Campaign, campaignData);

    return manager.save(campaign);
  }

  private async createScheduleEntry(
    manager: EntityManager,
    campaign: Campaign,
    startDate: Date,
    endDate?: Date | null,
  ): Promise<ScheduleEntry> {
    const schedule = manager.create(ScheduleEntry, {
      type: ScheduleType.CAMPAIGN,
      startDate,
      endDate: endDate ?? null,
      campaign,
    });

    return manager.save(schedule);
  }

  async createCampaign(createCampaignDto: CreateCampaignDto) {
    return this.dataSource.transaction(async (manager) => {
      const { startDate, endDate, ...campaignData } = createCampaignDto;

      const campaign = await this.createCampaignEntity(manager, campaignData);

      if (startDate !== undefined && startDate !== null) {
        await this.createScheduleEntry(manager, campaign, startDate, endDate);
      }

      return manager.findOneOrFail(Campaign, {
        where: {
          id: campaign.id,
        },
        relations: {
          scheduleEntry: true,
        },
      });
    });
  }

  async updateCampaign(
    id: number,
    updateCampaignDto: UpdateCampaignDto,
  ): Promise<Campaign> {
    return this.dataSource.transaction(async (manager) => {
      const { startDate, endDate, ...campaignData } = updateCampaignDto;

      const campaign = await manager.findOneOrFail(Campaign, {
        where: { id },
        relations: {
          scheduleEntry: true,
        },
      });

      manager.merge(Campaign, campaign, campaignData);

      await manager.save(Campaign, campaign);

      if (startDate === null) {
        if (campaign.scheduleEntry) {
          await manager.remove(ScheduleEntry, campaign.scheduleEntry);
        }
      } else if (startDate !== undefined) {
        if (campaign.scheduleEntry) {
          campaign.scheduleEntry.startDate = startDate;

          if (endDate !== undefined) {
            campaign.scheduleEntry.endDate = endDate;
          }

          await manager.save(ScheduleEntry, campaign.scheduleEntry);
        } else {
          await this.createScheduleEntry(manager, campaign, startDate, endDate);
        }
      } else if (endDate !== undefined && campaign.scheduleEntry) {
        campaign.scheduleEntry.endDate = endDate;
        await manager.save(ScheduleEntry, campaign.scheduleEntry);
      }

      return manager.findOneOrFail(Campaign, {
        where: { id },
        relations: {
          scheduleEntry: true,
        },
      });
    });
  }

  async findCampaignList(): Promise<CampaignListDto[]> {
    const campaigns = await this.campaignRepo
      .createQueryBuilder('campaign')
      .select('campaign.id', 'id')
      .addSelect('campaign.name', 'name')
      .addSelect('campaign.status', 'status')
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(*)')
            .from(CampaignClient, 'cc')
            .where('cc.campaign_id = campaign.id'),
        'clientesCount',
      )
      .addSelect(
        (subQuery) =>
          subQuery
            .select('COUNT(*)')
            .from(Interaction, 'interaction')
            .innerJoin('interaction.campaignClient', 'cc')
            .where('cc.campaign_id = campaign.id'),
        'interactionsCount',
      )
      .getRawMany();

    return campaigns.map((campaign) => ({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      summary: {
        clients: Number(campaign.clientsCount),
        interactions: Number(campaign.interactionsCount),
      },
    }));
  }

  async findCampaignDetail(id: number): Promise<CampaignDetailDto> {
    const campaign = await this.campaignRepo.findOneOrFail({
      where: { id },
      relations: {
        scheduleEntry: true,
      },
    });

    const reachRaw = await this.campaignRepo.manager
      .createQueryBuilder()
      .select('COUNT(DISTINCT cc.client_id)', 'totalClients')
      .addSelect(
        `COUNT(DISTINCT CASE
        WHEN interaction.id IS NOT NULL THEN cc.client_id
      END)`,
        'total',
      )
      .addSelect(
        `COUNT(DISTINCT CASE
        WHEN interaction.type = :call THEN cc.client_id
      END)`,
        'phone',
      )
      .addSelect(
        `COUNT(DISTINCT CASE
        WHEN interaction.type = :email THEN cc.client_id
      END)`,
        'email',
      )
      .addSelect(
        `COUNT(DISTINCT CASE
        WHEN interaction.type = :meeting THEN cc.client_id
      END)`,
        'meeting',
      )
      .addSelect(
        `COUNT(CASE
        WHEN interaction.type = :call THEN interaction.id
      END)`,
        'phoneInteractions',
      )
      .addSelect(
        `COUNT(CASE
        WHEN interaction.type = :email THEN interaction.id
      END)`,
        'emailInteractions',
      )
      .addSelect(
        `COUNT(CASE
        WHEN interaction.type = :meeting THEN interaction.id
      END)`,
        'meetingInteractions',
      )
      .from(CampaignClient, 'cc')
      .leftJoin('cc.interactions', 'interaction')
      .where('cc.campaign_id = :id', { id })
      .setParameters({
        call: InteractionType.CALL,
        email: InteractionType.EMAIL,
        meeting: InteractionType.MEETING,
      })
      .getRawOne();

    const totalClients = Number(reachRaw.totalClients);
    const contactedClients = Number(reachRaw.total);

    const percentage =
      totalClients > 0
        ? Math.round((contactedClients / totalClients) * 100)
        : 0;

    const latestInteractionQuery = this.campaignRepo.manager
      .createQueryBuilder()
      .subQuery()
      .select('latest.id')
      .from(Interaction, 'latest')
      .innerJoin('latest.scheduleEntry', 'latestSchedule')
      .where('latest.campaign_client_id = cc.id')
      .orderBy('latestSchedule.startDate', 'DESC')
      .addOrderBy('latest.id', 'DESC')
      .limit(1)
      .getQuery();

    const resultsRaw = await this.campaignRepo.manager
      .createQueryBuilder()
      .select(
        `COUNT(*) FILTER (
        WHERE latestInteraction.campaignResult = :positive
      )`,
        'positive',
      )
      .addSelect(
        `COUNT(*) FILTER (
        WHERE latestInteraction.campaignResult = :pending
      )`,
        'pending',
      )
      .addSelect(
        `COUNT(*) FILTER (
        WHERE latestInteraction.campaignResult = :negative
      )`,
        'negative',
      )
      .addSelect(
        `COUNT(*) FILTER (
        WHERE latestInteraction.campaignResult = :notContacted
      )`,
        'notContacted',
      )
      .from(CampaignClient, 'cc')
      .leftJoin(
        Interaction,
        'latestInteraction',
        `latestInteraction.id = (${latestInteractionQuery})`,
      )
      .where('cc.campaign_id = :id', { id })
      .setParameters({
        id,
        positive: CampaignResult.POSITIVE,
        pending: CampaignResult.PENDING,
        negative: CampaignResult.NEGATIVE,
        notContacted: CampaignResult.NOT_CONTACTED,
      })
      .getRawOne();

    const results = {
      positive: Number(resultsRaw.positive),
      pending: Number(resultsRaw.pending),
      negative: Number(resultsRaw.negative),
      notContacted: Number(resultsRaw.notContacted),
      positivePercentage:
        contactedClients > 0
          ? Math.round((Number(resultsRaw.positive) / contactedClients) * 100)
          : 0,
    };

    const campaignClients = await this.campaignRepo.manager
      .createQueryBuilder(CampaignClient, 'cc')
      .innerJoinAndSelect('cc.client', 'client')
      .leftJoinAndSelect('client.contacts', 'contact')
      .where('cc.campaign_id = :id', { id })
      .getMany();

    const interactions = await this.campaignRepo.manager
      .createQueryBuilder(Interaction, 'interaction')
      .innerJoin('interaction.campaignClient', 'cc')
      .where('cc.campaign_id = :id', { id })
      .getMany();

    const interactionsByCampaignClient = new Map<number, Interaction[]>();

    for (const interaction of interactions) {
      const campaignClientId = interaction.campaignClient?.id;

      if (campaignClientId === undefined) {
        continue;
      }

      const current = interactionsByCampaignClient.get(campaignClientId) ?? [];

      current.push(interaction);
      interactionsByCampaignClient.set(campaignClientId, current);
    }

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      description: campaign.description,
      startDate: campaign.scheduleEntry?.startDate ?? null,
      endDate: campaign.scheduleEntry?.endDate ?? null,

      summary: {
        reach: {
          total: contactedClients,
          phone: Number(reachRaw.phone),
          email: Number(reachRaw.email),
          meeting: Number(reachRaw.meeting),
          percentage,
          phoneInteractions: Number(reachRaw.phoneInteractions),
          emailInteractions: Number(reachRaw.emailInteractions),
          meetingInteractions: Number(reachRaw.meetingsInteractions),
        },
        results,
      },

      clients: campaignClients.map((cc) => ({
        id: cc.id,
        clientId: cc.client.id,
        organization: cc.client.organization,

        contacts: cc.client.contacts.map((contact) => ({
          id: contact.id,
          name: contact.name,
          role: contact.role,
          telephone: contact.telephone,
          email: contact.email,
        })),

        interactions: (interactionsByCampaignClient.get(cc.id) ?? []).map(
          (interaction) => ({
            id: interaction.id,
            type: interaction.type,
            campaignResult: interaction.campaignResult,
          }),
        ),
      })),
    };
  }

  async findCampaignDetailWithRelations(
    id: number,
  ): Promise<CampaignDetailDto> {
    const campaign = await this.campaignRepo.findOneOrFail({
      where: { id },
      relations: {
        scheduleEntry: true,
        campaignClients: {
          client: {
            contacts: true,
          },
          interactions: true,
        },
      },
    });

    const totalClients = campaign.campaignClients.length;

    const reachRaw = await this.campaignRepo.manager
      .createQueryBuilder()
      .select(
        `COUNT(DISTINCT CASE
        WHEN interaction.id IS NOT NULL
        THEN cc.client_id
      END)`,
        'total',
      )
      .addSelect(
        `COUNT(DISTINCT CASE
        WHEN interaction.type = :call
        THEN cc.client_id
      END)`,
        'phone',
      )
      .addSelect(
        `COUNT(DISTINCT CASE
        WHEN interaction.type = :email
        THEN cc.client_id
      END)`,
        'email',
      )
      .addSelect(
        `COUNT(DISTINCT CASE
        WHEN interaction.type = :meeting
        THEN cc.client_id
      END)`,
        'meeting',
      )
      .addSelect(
        `COUNT(CASE
        WHEN interaction.type = :call
        THEN interaction.id
      END)`,
        'phoneInteractions',
      )
      .addSelect(
        `COUNT(CASE
        WHEN interaction.type = :email
        THEN interaction.id
      END)`,
        'emailInteractions',
      )
      .addSelect(
        `COUNT(CASE
        WHEN interaction.type = :meeting
        THEN interaction.id
      END)`,
        'meetingsInteractions',
      )
      .from(CampaignClient, 'cc')
      .leftJoin('cc.interactions', 'interaction')
      .where('cc.campaign_id = :id', { id })
      .setParameters({
        call: InteractionType.CALL,
        email: InteractionType.EMAIL,
        meeting: InteractionType.MEETING,
      })
      .getRawOne();

    const contactedClients = Number(reachRaw.total);
    const phone = Number(reachRaw.phone);
    const email = Number(reachRaw.email);
    const meeting = Number(reachRaw.visits);

    const percentage =
      totalClients > 0
        ? Math.round((contactedClients / totalClients) * 100)
        : 0;

    const latestResults = new Map<number, CampaignResult>();

    for (const cc of campaign.campaignClients) {
      const sortedInteractions = [...cc.interactions].sort((a, b) => {
        const dateA = a.scheduleEntry.startDate?.getTime() ?? 0;
        const dateB = b.scheduleEntry.startDate?.getTime() ?? 0;

        return dateB - dateA || b.id - a.id;
      });

      const latestInteraction = sortedInteractions[0];

      if (latestInteraction) {
        latestResults.set(
          cc.client.id,
          latestInteraction.campaignResult ?? CampaignResult.NOT_CONTACTED,
        );
      }
    }

    const results = {
      positive: 0,
      pending: 0,
      negative: 0,
      notContacted: 0,
      positivePercentage: 0,
    };

    for (const cc of campaign.campaignClients) {
      const result = latestResults.get(cc.client.id);

      if (result === undefined || result === CampaignResult.NOT_CONTACTED) {
        results.notContacted++;
        continue;
      }

      switch (result) {
        case CampaignResult.POSITIVE:
          results.positive++;
          break;

        case CampaignResult.PENDING:
          results.pending++;
          break;

        case CampaignResult.NEGATIVE:
          results.negative++;
          break;
      }
    }

    results.positivePercentage =
      contactedClients > 0
        ? Math.round((results.positive / contactedClients) * 100)
        : 0;

    return {
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      description: campaign.description,
      startDate: campaign.scheduleEntry?.startDate ?? null,
      endDate: campaign.scheduleEntry?.endDate ?? null,

      summary: {
        reach: {
          total: contactedClients,
          phone,
          email,
          meeting,
          percentage,
          phoneInteractions: Number(reachRaw.phoneInteractions),
          emailInteractions: Number(reachRaw.emailInteractions),
          meetingInteractions: Number(reachRaw.visitInteractions),
        },
        results,
      },

      clients: campaign.campaignClients.map((cc) => ({
        id: cc.id,
        clientId: cc.client.id,
        organization: cc.client.organization,

        contacts: cc.client.contacts.map((contact) => ({
          id: contact.id,
          name: contact.name,
          role: contact.role,
          telephone: contact.telephone,
          email: contact.email,
        })),

        interactions: cc.interactions.map((interaction) => ({
          id: interaction.id,
          type: interaction.type,
          campaignResult: interaction.campaignResult,
        })),
      })),
    };
  }

  async addClientCampaign(
    campaignId: number,
    clientId: number,
  ): Promise<CampaignClient> {
    return this.dataSource.transaction(async (manager) => {
      const campaign = await manager.findOneByOrFail(Campaign, {
        id: campaignId,
      });

      const client = await manager.findOneByOrFail(Client, {
        id: clientId,
      });

      const existing = await manager.findOne(CampaignClient, {
        where: {
          campaign: { id: campaignId },
          client: { id: clientId },
        },
      });

      if (existing) {
        throw new ConflictException(
          'Este cliente ya está asociado a la campaña',
        );
      }

      const campaignClient = manager.create(CampaignClient, {
        campaign,
        client,
      });

      return manager.save(CampaignClient, campaignClient);
    });
  }

  async removeCampaign(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const campaign = await manager.findOne(Campaign, {
        where: { id },
        relations: {
          scheduleEntry: true,
          campaignClients: true,
        },
      });

      if (!campaign) {
        throw new NotFoundException('Campaña no encontrada');
      }

      const campaignClientIds = campaign.campaignClients.map(
        (campaignClient) => campaignClient.id,
      );

      // Delete interactions
      if (campaignClientIds.length > 0) {
        await manager
          .createQueryBuilder()
          .delete()
          .from(Interaction)
          .where('campaign_client_id IN (:...ids)', {
            ids: campaignClientIds,
          })
          .execute();
      }

      // Delete startDate of scheduleEntry
      if (campaign.scheduleEntry) {
        await manager.remove(ScheduleEntry, campaign.scheduleEntry);
      }

      // Delete campaign
      await manager.remove(Campaign, campaign);
    });
  }
}
