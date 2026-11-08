export enum UserRole {
  STANDARD = 'standard',
  ADMIN = 'admin'
}

export interface AuthToken {
  access_token: string;
  token_type: string;
}

export interface RegisterRequest {
  nome: string;
  cognome: string;
  email: string;
  password: string;
  indirizzo?: string | null;
}

export interface UserRead {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo: UserRole;
  indirizzo: string | null;
  saldo: number;
}