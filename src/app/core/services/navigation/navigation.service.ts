import { Injectable, computed, inject } from '@angular/core';

import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

import { NavigationItem } from '../../models/navigation-item.model';

import { UserRole } from '../../models/user-role.type';

// Centralizes navigation configuration and determines which menu
// items should be visible to the currently authenticated user.
@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Extracts navigation metadata from the application's route configuration.
  readonly navigationItems = computed(() => {
    const items: NavigationItem[] = this.router.config
      .filter((route) => route.data?.['showInNavigation'])
      .map((route) => ({
        path: route.path ?? '',
        title: route.data?.['title'] as string,
        roles: route.data?.['roles'] as UserRole[],
      }));

    return items;
  });

  // Returns only the navigation items the current user is authorized to see.
  readonly visibleNavigationItems = computed(() => {
    const currentUserRole = this.authService.userRole();

    // Do not show protected navigation when no user is authenticated.
    if (!currentUserRole) {
      return [];
    }

    return this.navigationItems().filter((item) => item.roles.includes(currentUserRole));
  });
}
