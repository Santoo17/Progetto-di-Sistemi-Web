import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../tokens/config';
import { UserRead } from '../models/user';


@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly baseUrl =  inject(API_URL);

  getMe(): Observable<UserRead> {
    return this.http.get<UserRead>(`${this.baseUrl}/users/me`);
  }
  
}