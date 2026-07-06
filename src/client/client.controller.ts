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
import { CreateClientDto } from './dtos/create-client.dto';
import { CreateContactDto } from './dtos/create-contact.dto';
import { UpdateClientDto } from './dtos/update-client.dto';
import { UpdateContactDto } from './dtos/update-contact.dto';

@Controller('clients')
export class ClientController {
  constructor(private clientService: ClientService) {}

  // =========================
  // CLIENTS
  // =========================

  @Post()
  createClient(@Body() createClientDto: CreateClientDto) {
    return this.clientService.createClient(createClientDto);
  }

  @Get()
  findAllClients(@Query('include') include?: string) {
    return this.clientService.findAll(include);
  }

  @Get(':id')
  findOneClient(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findOne(id);
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

  // =========================
  // CONTACTS
  // =========================

  @Post(':clientId/contacts')
  createContact(
    @Param('clientId', ParseIntPipe) clientId: number,
    @Body() createContactDto: CreateContactDto,
  ) {
    return this.clientService.createContact(clientId, createContactDto);
  }

  @Patch('contacts/:id')
  updateContact(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateContactDto: UpdateContactDto,
  ) {
    return this.clientService.updateContact(id, updateContactDto);
  }

  @Delete('contacts/:id')
  removeContact(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.removeContact(id);
  }
}
