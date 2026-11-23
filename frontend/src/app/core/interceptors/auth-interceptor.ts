import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { EMPTY, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();

  // Ignora gli endpoint di autenticazione (login, register)
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    return next(req);
  }

  // 1. Controllo preventivo: se c'è un token ma è già scaduto, pulisce e rimanda al login
  if (token && auth.isTokenExpired(token)) {
    auth.logout();
    router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
    return EMPTY;
  }

  // 2. Aggiunge l'header Authorization come prima
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  // 3. Controllo di sicurezza: se il backend risponde comunque 401, rimanda al login, il token anche se non scaduto
  //  potrebbe essere stato invalidato lato server 
  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
        router.navigate(['/login']);

      }
      return throwError(() => err);
    })
  );
};