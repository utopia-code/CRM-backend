import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { AddCampaignClientDto } from './dto/add-campaign-client-dto';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  createCampaign(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.createCampaign(createCampaignDto);
  }

  @Post(':id/clients')
  addClientCampaign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AddCampaignClientDto,
  ) {
    return this.campaignsService.addClientCampaign(id, dto.clientId);
  }

  @Get()
  findCampaignList() {
    return this.campaignsService.findCampaignList();
  }

  @Get(':id')
  findCampaignDetail(@Param('id', ParseIntPipe) id: number) {
    return this.campaignsService.findCampaignDetail(id);
  }

  @Patch(':id')
  updateCampaign(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignsService.updateCampaign(+id, updateCampaignDto);
  }

  @Delete(':id')
  removeCampaign(@Param('id') id: string) {
    return this.campaignsService.removeCampaign(+id);
  }
}
