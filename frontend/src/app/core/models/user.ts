export interface UserRead {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo: string;
  indirizzo: string | null;
  saldo: number;
}