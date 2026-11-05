import { Injectable, computed, signal } from '@angular/core';

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

  // Initialize the authentication Signal using the previously
  // persisted browser state when the application starts.
  private readonly isAuthenticatedState = signal(this.getStoredAuthenticationState());

  // Exposes the authentication state as a read-only value.
  // Other parts of the application can read this state but cannot
  // directly modify the internal Signal.
  readonly isAuthenticated = computed(() => this.isAuthenticatedState());

  login(): void {
    // Update the in-memory authentication state.
    this.isAuthenticatedState.set(true);

    // Persist the demo login state so it can be restored
    // when the browser refreshes.
    localStorage.setItem(this.authStorageKey, 'true');
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
}
