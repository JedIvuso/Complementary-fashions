import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const auth = inject(AuthService);
  return next(req).pipe(
    catchError(error => {
      if (error.status === 401) {
        auth.logout();
        toast.error('Session expired. Please log in again.');
      } else if (error.status === 403) {
        toast.error('You do not have permission to perform this action.');
      } else if (error.status >= 500) {
        toast.error('Server error. Please try again later.');
      }
      return throwError(() => error);
    })
  );
};
