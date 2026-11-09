import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { APP_CONFIG } from '../../config/app-config.token';
import { DashboardApiService } from './dashboard-api.service';

describe('DashboardApiService resident cache', () => {
  let service: DashboardApiService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: APP_CONFIG,
          useValue: {
            apiBaseUrl: 'http://localhost:3000',
            production: false,
          },
        },
      ],
    });

    service = TestBed.inject(DashboardApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('shares and caches a residents request', () => {
    const firstResult: unknown[] = [];
    const secondResult: unknown[] = [];

    service.getResidents().subscribe((residents) => firstResult.push(residents));
    service.getResidents().subscribe((residents) => secondResult.push(residents));

    const request = httpTestingController.expectOne('http://localhost:3000/residents');
    expect(request.request.method).toBe('GET');

    const residents = [{ id: 1, flatNumber: 'A-101', name: 'Resident' }];
    request.flush(residents);

    expect(firstResult).toEqual([residents]);
    expect(secondResult).toEqual([residents]);

    service.getResidents().subscribe((result) => secondResult.push(result));
    expect(secondResult).toEqual([residents, residents]);
    httpTestingController.expectNone('http://localhost:3000/residents');
  });

  it('fetches residents again after the cache is cleared', () => {
    service.getResidents().subscribe();
    const firstRequest = httpTestingController.expectOne('http://localhost:3000/residents');
    firstRequest.flush([]);

    service.clearResidentsCache();
    service.getResidents().subscribe();

    const refreshedRequest = httpTestingController.expectOne('http://localhost:3000/residents');
    expect(refreshedRequest.request.method).toBe('GET');
    refreshedRequest.flush([]);
  });
});
