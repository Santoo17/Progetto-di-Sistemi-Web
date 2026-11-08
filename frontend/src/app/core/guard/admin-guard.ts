import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.getToken()) return router.createUrlTree(['/login']);
  if (auth.user()) return auth.isAdmin() || router.createUrlTree(['/products']);

  return auth.loadUser().pipe(
    map(u => u.ruolo === 'admin' || router.createUrlTree(['/products'])),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};