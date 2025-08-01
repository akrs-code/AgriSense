import { UserRole } from "../enums";


export interface LoginRequestDTO {
  phone: string;
  password: string;
}

export interface CreateUserDTO {
  name: string;
  phone: string;
  email?: string | null;
  password: string;
  role: UserRole;
}

export interface UpdateProfileRequestDTO {
  name?: string;
  email?: string;
  phone?: string;
  // Location update only includes address from this specific frontend flow
  location?: {
    address: string;
  };
}