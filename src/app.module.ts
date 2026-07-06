import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CatalogModule } from './catalog/catalog.module';
import { ClientModule } from './client/client.module';
import { InteractionsModule } from './interactions/interactions.module';
import { ScheduleModule } from './schedule/schedule.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'CRM-Galego',
      autoLoadEntities: true,
      synchronize: true, // SOLO desarrollo
    }),
    TasksModule,
    InteractionsModule,
    UsersModule,
    ClientModule,
    CatalogModule,
    ScheduleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
