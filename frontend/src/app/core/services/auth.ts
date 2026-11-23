import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { AuthResponse, RegisterRequest, UserRead, UserRole } from '../models/auth';
import { API_URL } from '../tokens/config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_URL) + '/auth';
  private readonly tokenKey = 'access_token';

  private readonly _isLoggedIn = signal<boolean>(this.hasValidToken());
  readonly isLoggedIn = this._isLoggedIn.asReadonly();

  private readonly _user = signal<UserRead | null>(null);
  readonly user = this._user.asReadonly();
  
  readonly isAdmin = computed(() => this._user()?.role === UserRole.ADMIN);

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, { email, password }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, data).pipe(
      tap(res => this.saveSession(res))
    );
  }

  loadUser(): Observable<UserRead> {
    return this.http.get<UserRead>(`${this.baseUrl}/me`).pipe(
      tap(u => {
        this._user.set(u);
        this._isLoggedIn.set(true);
      })
    );
  }

  async restoreSession(): Promise<void> {
    const token = this.getToken();
    if (!token) return;

    if (this.isTokenExpired(token)) {
      this.clearSession();
      return;
    }

    try {
      await firstValueFrom(this.loadUser());
    } catch (err) {
      // Invalida la sessione solo se il token è davvero rifiutato.
      // Su errori di rete o 5xx si mantiene il token.
      if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
        this.clearSession();
      }
    }
  }

  logout(): void {
    const token = this.getToken();
    this.clearSession();
    if (token) {
      this.http.post(`${this.baseUrl}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({ error: () => {} });
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isTokenExpired(token: string | null = this.getToken()): boolean {
    if (!token) return true;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));
      if (typeof payload.exp !== 'number') return true;
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  private saveSession(res: AuthResponse): void {
    localStorage.setItem(this.tokenKey, res.token);
    this._isLoggedIn.set(true);
    this._user.set(res.user);
  }

  private clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    this._isLoggedIn.set(false);
    this._user.set(null);
  }

   hasValidToken(): boolean {
    return !this.isTokenExpired();
  }
  
}