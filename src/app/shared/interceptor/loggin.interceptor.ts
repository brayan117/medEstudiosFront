import {
  HttpInterceptorFn,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';

import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {

  const start = performance.now();

  console.groupCollapsed(`${req.method} ${req.url}`);

  console.log('Request');

  console.log('URL:', req.url);

  console.log('Método:', req.method);

  console.log('Headers:', req.headers);

  console.log('Body:', req.body);

  console.groupEnd();

  return next(req).pipe(

    tap({

      next: (event) => {

        if (event instanceof HttpResponse) {

          const elapsed = (performance.now() - start).toFixed(2);

          console.groupCollapsed(`${req.method} ${req.url}`);

          console.log('Status:', event.status);

          console.log('Tiempo:', `${elapsed} ms`);

          console.log('Headers:', event.headers);

          console.log('Respuesta:', event.body);

          console.groupEnd();

        }

      },

      error: (error: HttpErrorResponse) => {

        const elapsed = (performance.now() - start).toFixed(2);

        console.groupCollapsed(`${req.method} ${req.url}`);

        console.log('Status:', error.status);

        console.log('Tiempo:', `${elapsed} ms`);

        console.log('Error:', error.error);

        console.groupEnd();

      }

    })

  );

};