import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Defines the login form and validation rules.
  // Reactive Forms provide a structured and scalable approach
  // for handling user input and form validation.
  readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  login(): void {
    // Stop the login process when the form contains invalid data.
    if (this.loginForm.invalid) {
      // Mark all fields as touched so validation messages become visible.
      this.loginForm.markAllAsTouched();
      return;
    }

    // In our current learning implementation, login simply updates
    // the authentication state. A production application would send
    // credentials to an identity provider or use MSAL for Entra ID.
    this.authService.login();

    // Navigate the authenticated user to the dashboard.
    this.router.navigate(['/dashboard']);
  }
}
