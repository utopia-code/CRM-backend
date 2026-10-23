import { InteractionCategory } from '../enums/interaction-category.enum';
import { InteractionType } from '../enums/interaction-type.enum';

export class InteractionDto {
  id: number;
  type: InteractionType;
  category: InteractionCategory;
  subject: string;
  notes: string | null;
  startDate: Date;
  duration: number | null;
}
