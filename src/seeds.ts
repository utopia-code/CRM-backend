import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from './app.module';
import { runSeed } from './seeds/seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const dataSource = app.get(DataSource);

  await runSeed(dataSource);

  await app.close();

  console.log('🌱 Seed completado');
}

bootstrap();
