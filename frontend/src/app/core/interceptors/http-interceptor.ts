import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) =>
  next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('HTTP error', error.status, error.message);
      // in futuro: mappare in un messaggio più leggibile o inviare a un servizio di logging
      return throwError(() => error);
    }),
  );