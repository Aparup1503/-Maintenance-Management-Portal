import { HttpInterceptorFn } from '@angular/common/http';

// Intercepts outgoing HTTP requests and centrally attaches the
// authentication token required by protected backend APIs.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Temporary token used only for learning the interceptor flow.
  // In a real application, this would come from an authentication
  // service or a library such as MSAL.
  const token = 'demo-access-token';

  // HttpRequest objects are immutable, so we create a cloned request
  // with the Authorization header instead of modifying the original request.
  const authenticatedRequest = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  // Continue the HTTP pipeline with the updated request.
  return next(authenticatedRequest);
};
