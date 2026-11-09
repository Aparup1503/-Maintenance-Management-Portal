import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { UserRole } from '../../models/user-role.type';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Identifies whether the application is running in the browser or on the server.
  private readonly platformId = inject(PLATFORM_ID);

  // Defines storage keys used to persist the demo authentication state.
  private readonly authStorageKey = 'maintenance-portal-authenticated';
  private readonly userRoleStorageKey = 'maintenance-portal-user-role';

  // Stores the role of the currently authenticated user.
  private readonly userRoleState = signal<UserRole | null>(this.getStoredUserRole());

  // Exposes the current user role as read-only application state.
  readonly userRole = computed(() => this.userRoleState());

  // Stores the current authentication state.
  private readonly isAuthenticatedState = signal(this.getStoredAuthenticationState());

  // Exposes authentication state as read-only state.
  readonly isAuthenticated = computed(() => this.isAuthenticatedState());

  login(role: UserRole = 'Admin'): void {
    // Update the in-memory state.
    this.isAuthenticatedState.set(true);
    this.userRoleState.set(role);

    // Persist authentication state only in the browser.
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.authStorageKey, 'true');
      localStorage.setItem(this.userRoleStorageKey, role);
    }
  }

  logout(): void {
    // Clear in-memory state.
    this.isAuthenticatedState.set(false);
    this.userRoleState.set(null);

    // Clear browser storage only when running in the browser.
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.authStorageKey);
      localStorage.removeItem(this.userRoleStorageKey);
    }
  }

  private getStoredAuthenticationState(): boolean {
    // localStorage exists only in the browser.
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    return localStorage.getItem(this.authStorageKey) === 'true';
  }

  private getStoredUserRole(): UserRole | null {
    // localStorage exists only in the browser.
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    const storedRole = localStorage.getItem(this.userRoleStorageKey);

    if (storedRole === 'Admin' || storedRole === 'Resident') {
      return storedRole;
    }

    return null;
  }
}
