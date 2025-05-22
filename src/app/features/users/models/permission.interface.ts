export interface Permission {
  id: number;
  name: string;
  description?: string;
  granted: boolean;
}