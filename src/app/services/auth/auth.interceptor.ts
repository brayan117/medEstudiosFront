import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  console.group(`[HTTP] ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);

  let authReq = req;
  if (token) {
    authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(authReq).pipe(
    tap({
      next: (event: any) => {
        if (event.type === 4) {
          console.log('Response status:', event.status);
          console.log('Response body:', event.body);
          console.groupEnd();
        }
      },
      error: (error) => {
        console.error('Error:', error);
        console.groupEnd();
      }
    })
  );
};
