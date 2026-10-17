import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ScheduleEntry } from 'src/schedule/entities/schedule-entry.entity';
import { ScheduleType } from 'src/schedule/enums/schedule-type.enum';
import { DataSource, EntityManager, Repository } from 'typeorm';
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

  findAll() {
    return `This action returns all campaigns`;
  }

  findOne(id: number) {
    return `This action returns a #${id} campaign`;
  }

  update(id: number, updateCampaignDto: UpdateCampaignDto) {
    return `This action updates a #${id} campaign`;
  }

  remove(id: number) {
    return `This action removes a #${id} campaign`;
  }
}
