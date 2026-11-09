import { ApplicationConfig } from '@angular/core';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { environment } from '../environments/environment.development';
import { APP_CONFIG } from './core/config/app-config.token';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpLoggingInterceptor } from './core/interceptors/http-logging.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,

      // Preloads all lazy-loaded routes in the background
      // after the initial application navigation.(You can check in Network Tab after intial load of your application)
      // This helps make future navigation faster because
      // the required route code may already be downloaded.
      withPreloading(PreloadAllModules),
    ),

    provideHttpClient(
      withInterceptors([authInterceptor, httpLoggingInterceptor, httpErrorInterceptor]),
    ), // Configure HttpClient and register application-wide interceptors.
    // Provides environment-specific application configuration
    // through Angular's dependency injection system.
    {
      provide: APP_CONFIG,
      useValue: environment,
    }, provideClientHydration(withEventReplay()),
  ],
};
