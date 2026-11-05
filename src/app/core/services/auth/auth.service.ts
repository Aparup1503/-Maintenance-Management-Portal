import { Injectable, computed, signal } from '@angular/core';
import { UserRole } from '../../models/user-role.type';

// Centralizes authentication-related state and operations.
// In a production application, this service would typically
// integrate with an identity provider such as Azure Entra ID.
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // Defines a single storage key so authentication persistence
  // is managed consistently throughout the application.
  private readonly authStorageKey = 'maintenance-portal-authenticated';
  private readonly userRoleStorageKey = 'maintenance-portal-user-role';

  // Stores the role of the currently authenticated user.
  // In a real application, this information would come from
  // token claims or the authenticated user profile.
  //private readonly userRoleState = signal<UserRole | null>(null);
  private readonly userRoleState = signal<UserRole | null>(this.getStoredUserRole());

  // Exposes the current user role as read-only application state.
  readonly userRole = computed(() => this.userRoleState());

  // Initialize the authentication Signal using the previously
  // persisted browser state when the application starts.
  private readonly isAuthenticatedState = signal(this.getStoredAuthenticationState());

  // Exposes the authentication state as a read-only value.
  // Other parts of the application can read this state but cannot
  // directly modify the internal Signal.
  readonly isAuthenticated = computed(() => this.isAuthenticatedState());

  login(role: UserRole = 'Admin'): void {
    // Update the in-memory authentication state.
    this.isAuthenticatedState.set(true);

    // Store the authenticated user's role.
    // In production, this value would come from the authenticated
    // user's token claims or identity provider.
    this.userRoleState.set(role);

    // Persist the demo login state so it can be restored
    // when the browser refreshes.
    localStorage.setItem(this.authStorageKey, 'true');

    // Persist the demo user role so it can be restored after refresh.
    localStorage.setItem(this.userRoleStorageKey, role);
  }

  logout(): void {
    // Clear the in-memory authentication state immediately.
    this.isAuthenticatedState.set(false);

    // Remove the persisted authentication state so future application
    // loads do not treat the user as authenticated.
    localStorage.removeItem(this.authStorageKey);
  }

  private getStoredAuthenticationState(): boolean {
    // Read the persisted authentication value when AuthService is created.
    // This allows the application to restore the demo login state
    // after a browser refresh.
    return localStorage.getItem(this.authStorageKey) === 'true';
  }

  private getStoredUserRole(): UserRole | null {
    // Read the persisted user role when AuthService is initialized.
    // Return null when no authenticated role exists.
    const storedRole = localStorage.getItem(this.userRoleStorageKey);

    // Validate the stored value before treating it as a valid role.
    if (storedRole === 'Admin' || storedRole === 'Resident') {
      return storedRole;
    }

    return null;
  }
}
