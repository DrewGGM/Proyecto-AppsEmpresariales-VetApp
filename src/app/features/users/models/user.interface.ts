import { UserRole } from './role.enum';

export interface User {
  id: number;
  name: string;
  lastName: string;
  email: string;
  role: UserRole;
  photoUrl?: string | null; 
  lastAccess?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  active: boolean;
}