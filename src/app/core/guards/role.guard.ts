import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth/auth.service';

import { UserRole } from '../models/user-role.type';

// Creates a route guard that allows navigation only when the
// authenticated user has one of the required roles.
export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Read the role of the currently authenticated user.
    const currentUserRole = authService.userRole();

    // Allow navigation when the user's role is authorized.
    if (currentUserRole && allowedRoles.includes(currentUserRole)) {
      return true;
    }

    // Redirect users without the required permission.
    return router.createUrlTree(['/dashboard']);
  };
}
