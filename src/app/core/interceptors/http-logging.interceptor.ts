import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';

import { tap } from 'rxjs';

// Intercepts every HTTP request passing through Angular HttpClient.
// This centralizes cross-cutting concerns such as logging,
// authentication headers, and global error handling.
export const httpLoggingInterceptor: HttpInterceptorFn = (request, next) => {
  // Log the outgoing HTTP request before forwarding it to the API.
  console.log(`[HTTP Request] ${request.method} ${request.url}`);

  // Pass the request to the next interceptor or backend.
  return next(request).pipe(
    // Observe the HTTP stream without modifying the response.
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          console.log(`[HTTP Response] ${request.method} ${request.url}`, event);
        }
      },

      error: (error) => {
        console.error(`[HTTP Error] ${request.method} ${request.url}`, error);
      },
    }),
  );
};
