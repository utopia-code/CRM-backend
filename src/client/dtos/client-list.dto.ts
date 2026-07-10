import { ClientStatus } from '../enums/client-status.enum';

export class ClientListContactDto {
  id: number;
  name: string;
  role: string;
  email: string;
  telephone: string;
}

export class ClientListDto {
  id: number;
  organization: string;
  status: ClientStatus;

  contacts: ClientListContactDto[];

  interactionsCount: number;
  tasksCount: number;
}
