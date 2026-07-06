import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';
import { Show } from './entities/show.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Show])],
  providers: [CatalogService],
  controllers: [CatalogController],
})
export class CatalogModule {}
