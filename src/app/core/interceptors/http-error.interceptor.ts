import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, switchMap, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      //-- Log detailed error information for debugging.
      console.error(`[HTTP Error] ${req.method} ${req.url}`, error);

      //-- Handle common HTTP status codes centrally.
      switch (error.status) {
        case 0:
          console.error('Unable to connect to the server.');
          break;

        case 401:
          console.error('You are not authorized. Please log in again.');
          break;

        case 403:
          console.error('You do not have permission to perform this action.');
          break;

        case 404:
          console.error('The requested resource was not found.');
          break;

        case 500:
          console.error('An unexpected server error occurred.');
          break;
      }
      //-- Re-throw the error so feature-level code can still decide
      //-- how to update its own UI state or display feature-specific messages.
      return throwError(() => error);
    }),
  );
};
