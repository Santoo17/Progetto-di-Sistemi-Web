import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, switchMap, tap } from 'rxjs';
import { AuthToken, RegisterRequest, UserRead, UserRole } from '../models/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8000/auth';
  private readonly usersUrl = 'http://localhost:8000/users';
  private readonly tokenKey = 'access_token';

  private readonly _isLoggedIn = signal<boolean>(!!localStorage.getItem(this.tokenKey));
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  private readonly _user = signal<UserRead | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAdmin = computed(() => this._user()?.ruolo === UserRole.ADMIN);

  login(email: string, password: string): Observable<AuthToken> {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    return this.http.post<AuthToken>(`${this.baseUrl}/login`, body.toString(), { headers }).pipe(
      tap(res => {
        localStorage.setItem(this.tokenKey, res.access_token);
        this._isLoggedIn.set(true);
      }),
      switchMap(res => this.loadUser().pipe(map(() => res)))
    );
  }

  loadUser(): Observable<UserRead> {
    return this.http.get<UserRead>(`${this.usersUrl}/me`).pipe(
      tap(u => this._user.set(u))
    );
  }

  restoreSession(): void {
    if (!this.getToken()) return;
    this.loadUser().subscribe({ error: () => this.logout() });
  }

  register(data: RegisterRequest): Observable<UserRead> {
    return this.http.post<UserRead>(`${this.baseUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this._isLoggedIn.set(false);
    this._user.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}