import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig } from './app/app.config';

console.log('1. main.ts execution started');

bootstrapApplication(App, appConfig)
  .then((appRef) => {
    console.log('4. Angular application bootstrapped');
    console.log('Application reference:', appRef);
  })
  .catch((error) => {
    console.error('Angular bootstrap failed:', error);
  });