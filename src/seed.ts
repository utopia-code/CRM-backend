import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';

import { AppModule } from './app.module';
import { seedClients } from './seeds/client.seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const dataSource = app.get(DataSource);

  await seedClients(dataSource);

  await app.close();

  console.log('✅ Clientes importados correctamente');
}

bootstrap();
