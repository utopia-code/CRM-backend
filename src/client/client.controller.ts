import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { ClientListDto } from './dtos/client-list.dto';
import { CreateClientDto } from './dtos/create-client.dto';
import { UpdateClientDto } from './dtos/update-client.dto';

@Controller('clients')
export class ClientController {
  constructor(private clientService: ClientService) {}

  @Post()
  createClient(@Body() createClientDto: CreateClientDto) {
    return this.clientService.createClient(createClientDto);
  }

  @Get('list')
  findListOfClients(): Promise<ClientListDto[]> {
    return this.clientService.findLClientsList();
  }

  @Get()
  findAllClients(@Query('include') include?: string) {
    return this.clientService.findAll(include);
  }

  @Get(':id')
  getClient(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.getClient(id);
  }

  @Patch(':id')
  updateClient(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientService.updateClient(id, updateClientDto);
  }

  @Delete(':id')
  removeClient(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.removeClient(id);
  }
}
