export type ActivityType = 'consultation' | 'vaccination' | 'login';

export interface UserActivity {
  id: number;
  type: ActivityType;
  description: string;
  details?: string;
  date: Date;
}