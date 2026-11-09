import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { UserRoleService } from '../services/user-role.service';

/**
 * Allows navigation only for users with the Admin role.
 */
export const adminGuard: CanActivateFn = () => {
  const userRoleService = inject(UserRoleService);
  const router = inject(Router);

  // Allow access only to administrators.
  if (userRoleService.isAdmin()) {
    return true;
  }

  // Redirect unauthorized users to the dashboard.
  return router.createUrlTree(['/dashboard']);
};
