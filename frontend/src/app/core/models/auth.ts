export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin'
}

export interface UserRead {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  user: UserRead;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}