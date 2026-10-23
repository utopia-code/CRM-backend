import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateCampaignInteractionDto } from './dtos/create-campaign-interaction.dto';
import { CreateInteractionDto } from './dtos/create-interaction.dto';
import { CreateProposalInteractionDto } from './dtos/create-proposal-interaction.dto';
import { UpdateCampaignInteractionDto } from './dtos/update-campaign-interaction.dto';
import { UpdateInteractionDto } from './dtos/update-interaction.dto';
import { UpdateProposalInteractionDto } from './dtos/update-proposal-interaction.dto';
import { InteractionsService } from './interactions.service';

@Controller('interactions')
export class InteractionsController {
  constructor(private readonly interactionsService: InteractionsService) {}

  @Post()
  createInteraction(@Body() dto: CreateInteractionDto) {
    return this.interactionsService.createInteraction(dto);
  }

  @Post('campaign')
  createCampaignInteraction(@Body() dto: CreateCampaignInteractionDto) {
    return this.interactionsService.createCampaignInteraction(dto);
  }

  @Post('proposal')
  createProposalInteraction(@Body() dto: CreateProposalInteractionDto) {
    return this.interactionsService.createProposalInteraction(dto);
  }

  @Get('clients/:clientId/interactions')
  findClientInteractions(@Param('id', ParseIntPipe) clientId: number) {
    return this.interactionsService.findClientInteractions(clientId);
  }

  @Get('clients/:clientId/proposals')
  findClientProposals(@Param('id', ParseIntPipe) clientId: number) {
    return this.interactionsService.findClientProposals(clientId);
  }

  @Get('recent')
  findRecentInteractions() {
    return this.interactionsService.findRecentInteractions();
  }

  @Get('summary-weekly')
  getWeeklyInteractionSummary() {
    return this.interactionsService.getWeeklyInteractionSummary();
  }

  @Patch(':id/campaign')
  updateCampaignInteraction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCampaignInteractionDto,
  ) {
    return this.interactionsService.updateCampaignInteraction(id, dto);
  }

  @Patch(':id/proposal')
  updateProposalInteraction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProposalInteractionDto,
  ) {
    return this.interactionsService.updateProposalInteraction(id, dto);
  }

  @Patch(':id')
  updateInteraction(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateInteractionDto,
  ) {
    return this.interactionsService.updateInteraction(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeInteraction(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.interactionsService.removeInteraction(id);
  }
}
