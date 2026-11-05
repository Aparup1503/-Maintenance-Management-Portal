import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { inject } from '@angular/core';
// Protects application routes by checking the current
// authentication state before allowing navigation.
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Allow navigation when the user is authenticated.
  if (authService.isAuthenticated()) {
    return true;
  }
  // Redirect unauthenticated users to the login page.
  return router.createUrlTree(['/login']);
};
