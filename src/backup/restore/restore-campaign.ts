import { Campaign } from 'src/campaigns/entities/campaign.entity';
import { EntityManager } from 'typeorm';
import { BackupCampaignDto } from '../dto/backup-campaign.dto';

export async function restoreCampaigns(
  manager: EntityManager,
  campaigns: BackupCampaignDto[],
): Promise<void> {
  const repository = manager.getRepository(Campaign);

  const entities = campaigns.map((campaign) =>
    repository.create({
      id: campaign.id,
      name: campaign.name,
      status: campaign.status,
      description: campaign.description,
    }),
  );

  if (entities.length) {
    await repository.save(entities);
  }

  console.log(`✅ Restored ${entities.length} campaigns`);
}
