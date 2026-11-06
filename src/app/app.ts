import { Component, inject } from '@angular/core';
import { NavigationService } from './core/services/navigation/navigation.service';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly navigationService = inject(NavigationService);
  constructor() {
    console.log('2. Root component constructor executed');
  }

  ngOnInit() {
    console.log('3. Root component ngOnInit executed');
  }

  logout(): void {
    // Clear the current authentication state and remove the
    // persisted demo login information.
    this.authService.logout();

    // Return the user to the public login page.
    this.router.navigate(['/login']);
  }
}
