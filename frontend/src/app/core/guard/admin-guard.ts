import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth';
import { UserRole } from '../models/auth';
import { MatSnackBar } from '@angular/material/snack-bar';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);

  const denied = () => {
    snackBar.open('Non hai i permessi per accedere a questa pagina', 'Chiudi', { duration: 3000 });
    return router.createUrlTree(['/products']);
  };

  if (!auth.getToken()) return router.createUrlTree(['/login']);
  if (auth.user()) return auth.isAdmin() || denied();

  return auth.loadUser().pipe(
    map(u => u.role === UserRole.ADMIN || denied()),
    catchError(() => of(router.createUrlTree(['/login'])))
  );
};