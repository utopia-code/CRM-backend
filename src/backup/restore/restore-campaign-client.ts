import { CampaignClient } from 'src/campaigns/entities/campaign-client.entity';
import { Campaign } from 'src/campaigns/entities/campaign.entity';
import { Client } from 'src/client/entities/client.entity';
import { EntityManager } from 'typeorm';
import { BackupCampaignClientDto } from '../dto/backup-campaign-client.dto';

export async function restoreCampaignClients(
  manager: EntityManager,
  campaignClients: BackupCampaignClientDto[],
): Promise<void> {
  const repository = manager.getRepository(CampaignClient);

  const entities = campaignClients.map((cc) =>
    repository.create({
      id: cc.id,
      createdAt: new Date(cc.createdAt),
      campaign: { id: cc.campaignId } as Campaign,
      client: { id: cc.clientId } as Client,
    }),
  );

  if (entities.length) {
    await repository.save(entities);
  }

  console.log(`✅ Restored ${entities.length} campaign clients`);
}
