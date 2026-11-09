import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';

import { tap } from 'rxjs';
import { SKIP_HTTP_LOGGING } from '../http/http-context.tokens';

// Intercepts every HTTP request passing through Angular HttpClient.
// This centralizes cross-cutting concerns such as logging,
// authentication headers, and global error handling.
export const httpLoggingInterceptor: HttpInterceptorFn = (request, next) => {
  const skipLogging = request.context.get(SKIP_HTTP_LOGGING);

  // Skip logging for requests that explicitly opt out.
  if (skipLogging) {
    return next(request);
  }
  const startedAt = performance.now();
  // Log the outgoing HTTP request before forwarding it to the API.
  console.log(`[HTTP Request] ${request.method} ${request.url}`);

  // Pass the request to the next interceptor or backend.
  return next(request).pipe(
    // Observe the HTTP stream without modifying the response.
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          console.log(
            `[HTTP Response] ${request.method} ${request.url} completed in ${Math.round(
              performance.now() - startedAt,
            )}ms`,
          );
        }
      },

      error: (error) => {
        console.error(`[HTTP Error] ${request.method} ${request.url}`, error);
      },
    }),
  );
};
