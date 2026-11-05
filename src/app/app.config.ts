import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment.development';
import { APP_CONFIG } from './core/config/app-config.token';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideHttpClient(), //--Registers Angular's HttpClient services at the application level.

    //-- Provides environment-specific application configuration
    //-- through Angular's dependency injection system.
    {
      provide: APP_CONFIG,
      useValue: environment,
    },
  ],
};
