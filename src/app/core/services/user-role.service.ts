import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserRoleService {
  // Simulates the current user's role.
  // Later, this can be populated from your authentication API or JWT token.
  readonly isAdmin = signal(true);

  /**
   * Changes the current user's role for testing.
   */
  setAdminRole(isAdmin: boolean): void {
    this.isAdmin.set(isAdmin);
  }
}
