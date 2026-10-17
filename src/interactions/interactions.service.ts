import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Show } from 'src/catalog/entities/show.entity';
import { Client } from 'src/client/entities/client.entity';
import { Repository } from 'typeorm';
import { CreateCampaignInteractionDto } from './dtos/create-campaign-interaction.dto';
import { CreateInteractionDto } from './dtos/create-interaction.dto';
import { CampaignClient } from './entities/campaign-client.entity';
import { Interaction } from './entities/interaction.entity';
import { InteractionCategory } from './enums/interaction-category.enum';

@Injectable()
export class InteractionsService {
  constructor(
    @InjectRepository(Interaction)
    private readonly interactionRepo: Repository<Interaction>,

    @InjectRepository(Client)
    private readonly clientRepo: Repository<Client>,

    @InjectRepository(CampaignClient)
    private readonly campaignClientRepo: Repository<CampaignClient>,

    @InjectRepository(Show)
    private readonly showRepo: Repository<Show>,
  ) {}

  async createInteraction(dto: CreateInteractionDto) {
    const client = await this.clientRepo.findOneBy({
      id: dto.clientId,
    });

    if (!client) {
      throw new NotFoundException('Client not found');
    }

    const interaction = this.interactionRepo.create({
      client,
      type: dto.type,
      subject: dto.subject,
      notes: dto.notes,
      duration: dto.duration,
      category: InteractionCategory.GENERAL,
    });

    return this.interactionRepo.save(interaction);
  }

  async createCampaignInteraction(dto: CreateCampaignInteractionDto) {
    const campaignClient = await this.campaignClientRepo.findOne({
      where: {
        id: dto.campaignClientId,
        client: {
          id: dto.clientId,
        },
      },
      relations: {
        client: true,
      },
    });

    if (!campaignClient) {
      throw new NotFoundException(
        'Campaign participation not found for this client',
      );
    }

    const interaction = this.interactionRepo.create({
      client: campaignClient.client,
      campaignClient,
      type: dto.type,
      subject: dto.subject,
      notes: dto.notes,
      duration: dto.duration,
      campaignResult: dto.campaignResult,
      category: InteractionCategory.CAMPAIGN,
    });

    return this.interactionRepo.save(interaction);
  }
}
