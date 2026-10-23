import { InteractionCategory } from '../enums/interaction-category.enum';
import { InteractionType } from '../enums/interaction-type.enum';

export class RecentInteractionDto {
  id: number;
  type: InteractionType;
  category: InteractionCategory;
  subject: string;
  startDate: Date;
  organization: string | null;
}
