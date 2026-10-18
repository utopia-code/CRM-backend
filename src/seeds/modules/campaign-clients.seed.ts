import { faker } from '@faker-js/faker';
import { CampaignClient } from 'src/campaigns/entities/campaign-client.entity';
import { Campaign } from 'src/campaigns/entities/campaign.entity';
import { Client } from 'src/client/entities/client.entity';
import { DataSource } from 'typeorm';

export async function seedCampaignClients(
  dataSource: DataSource,
  campaigns: Campaign[],
  clients: Client[],
): Promise<CampaignClient[]> {
  const repository = dataSource.getRepository(CampaignClient);

  if (!campaigns.length || !clients.length) {
    console.log('✔ 0 asociaciones de campañas');
    return [];
  }

  const associations: CampaignClient[] = [];

  for (const campaign of campaigns) {
    const maxClients = Math.min(8, clients.length);
    const minClients = Math.min(3, maxClients);

    const amount = faker.number.int({
      min: minClients,
      max: maxClients,
    });

    const selectedClients = faker.helpers
      .shuffle([...clients])
      .slice(0, amount);

    for (const client of selectedClients) {
      associations.push(
        repository.create({
          campaign,
          client,
        }),
      );
    }
  }

  const savedAssociations = await repository.save(associations);

  console.log(`✔ ${savedAssociations.length} asociaciones de campañas`);

  return savedAssociations;
}
