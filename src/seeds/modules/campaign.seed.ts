import { Campaign } from 'src/campaigns/entities/campaign.entity';
import { CampaignStatus } from 'src/campaigns/enums/campaign-status.enum';
import { DataSource } from 'typeorm';

export async function seedCampaigns(
  dataSource: DataSource,
): Promise<Campaign[]> {
  const repository = dataSource.getRepository(Campaign);

  const campaigns = repository.create([
    {
      name: 'Campaña de otoño',
      status: CampaignStatus.ACTIVE,
      description: 'Contacto con clientes para la temporada de otoño.',
    },
    {
      name: 'Programación cultural 2027',
      status: CampaignStatus.PLANNED,
      description: 'Propuesta de espectáculos para la próxima temporada.',
    },
    {
      name: 'Seguimiento de propuestas',
      status: CampaignStatus.ACTIVE,
      description: 'Seguimiento de propuestas comerciales enviadas.',
    },
    {
      name: 'Campaña de verano',
      status: CampaignStatus.CLOSED,
      description: 'Campaña de captación para la temporada de verano.',
    },
  ]);

  const savedCampaigns = await repository.save(campaigns);

  console.log(`✔ ${savedCampaigns.length} campañas`);

  return savedCampaigns;
}
