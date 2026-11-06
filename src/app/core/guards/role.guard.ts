import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

import { AuthService } from '../services/auth/auth.service';

import { UserRole } from '../models/user-role.type';

// Protects routes based on the roles configured in the route metadata.
// This keeps role configuration centralized in app.routes.ts.
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Read the roles allowed to access the current route
  // directly from the route's data configuration.
  const allowedRoles = route.data['roles'] as UserRole[] | undefined;

  // If no role restriction is configured, allow navigation.
  // Authentication is handled separately by authGuard.
  if (!allowedRoles?.length) {
    return true;
  }

  // Read the role of the currently authenticated user.
  const currentUserRole = authService.userRole();

  // Allow navigation when the user's role is authorized.
  if (currentUserRole && allowedRoles.includes(currentUserRole)) {
    return true;
  }

  // Redirect users without the required permission.
  return router.createUrlTree(['/dashboard']);
};
