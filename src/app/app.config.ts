import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { environment } from '../environments/environment.development';
import { APP_CONFIG } from './core/config/app-config.token';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { httpLoggingInterceptor } from './core/interceptors/http-logging.interceptor';
import { httpErrorInterceptor } from './core/interceptors/http-error.interceptor';
import { authInterceptor } from './core/interceptors/auth.interceptor';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),

    provideHttpClient(
      withInterceptors([authInterceptor, httpLoggingInterceptor, httpErrorInterceptor]),
    ), //-- Configure HttpClient and register application-wide interceptors.
    //-- Provides environment-specific application configuration
    //-- through Angular's dependency injection system.
    {
      provide: APP_CONFIG,
      useValue: environment,
    },
  ],
};
