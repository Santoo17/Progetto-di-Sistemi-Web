import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserRead {
  id: number;
  nome: string;
  cognome: string;
  email: string;
  ruolo: string;
  indirizzo: string | null;
  saldo: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);

  getMe(): Observable<UserRead> {
    return this.http.get<UserRead>('http://localhost:8000/users/me');
  }
}