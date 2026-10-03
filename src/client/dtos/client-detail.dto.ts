import { ClientStatus } from '../enums/client-status.enum';

export class ClientDetailDto {
  id: number;
  organization: string;
  subject: string | null;
  status: ClientStatus;
  notes: string | null;

  contacts: {
    id: number;
    name: string;
    role: string | null;
    email: string | null;
    telephone: string | null;
  }[];

  summary: {
    calls: number;
    emails: number;
    meetings: number;
    completedTasks: number;
    pendingTasks: number;
  };
}
