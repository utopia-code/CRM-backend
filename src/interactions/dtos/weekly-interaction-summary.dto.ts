export class WeeklyInteractionSummaryDto {
  totals: {
    call: number;
    email: number;
    meeting: number;
  };

  days: WeeklyInteractionDayDto[];
}

export class WeeklyInteractionDayDto {
  date: string;
  dayName: string;
  isToday: boolean;

  call: number;
  email: number;
  meeting: number;
}
