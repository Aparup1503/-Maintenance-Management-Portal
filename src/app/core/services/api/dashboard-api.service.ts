import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { forkJoin, Observable, shareReplay } from 'rxjs';

import { APP_CONFIG } from '../../config/app-config.token';

import { Expense } from '../../../shared/models/expense.model';
import { MaintenanceBill } from '../../../shared/models/maintenance-bill.model';
import { Payment } from '../../../shared/models/payment.model';
import { Resident } from '../../../shared/models/resident.model';
import { SKIP_HTTP_LOGGING } from '../../../core/http/http-context.tokens';

export interface DashboardData {
  expenses: Expense[];
  bills: MaintenanceBill[];
  residents: Resident[];
  payments: Payment[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly appConfig = inject(APP_CONFIG);

  private readonly apiBaseUrl = this.appConfig.apiBaseUrl;
  private residents$?: Observable<Resident[]>;

  // Stores the shared API Observable.
  // Multiple consumers can use the same response.
  getResidents(): Observable<Resident[]> {
    if (!this.residents$) {
      console.log('Creating residents API request');
      const context = new HttpContext().set(SKIP_HTTP_LOGGING, true);

      this.residents$ = this.http.get<Resident[]>(`${this.apiBaseUrl}/residents`, { context }).pipe(
        shareReplay({
          bufferSize: 1,
          refCount: true,
        }),
      );
    }

    // Return the same shared Observable to all consumers.
    return this.residents$;
  }

  clearResidentsCache(): void {
    // Remove the cached Observable.
    // The next getResidents() call will make a new HTTP request.
    this.residents$ = undefined;
  }

  /**
   * Loads all independent dashboard data sources in parallel.
   *
   * forkJoin waits until all HTTP requests complete and then
   * returns the combined result as one object.
   */
  // getDashboardData(): Observable<DashboardData> {
  //   return forkJoin({
  //     expenses: this.http.get<Expense[]>(`${this.apiBaseUrl}/expenses`, {
  //       context: new HttpContext().set(SKIP_HTTP_LOGGING, true),
  //     }),
  //     bills: this.http.get<MaintenanceBill[]>(`${this.apiBaseUrl}/bills`),
  //     residents: this.http.get<Resident[]>(`${this.apiBaseUrl}/residents`),
  //     payments: this.http.get<Payment[]>(`${this.apiBaseUrl}/payments`),
  //   });
  // }
  getDashboardData(): Observable<DashboardData> {
    const silentContext = new HttpContext().set(SKIP_HTTP_LOGGING, true);

    return forkJoin({
      expenses: this.http.get<Expense[]>(`${this.apiBaseUrl}/expenses`, { context: silentContext }),
      bills: this.http.get<MaintenanceBill[]>(`${this.apiBaseUrl}/bills`, {
        context: silentContext,
      }),
      residents: this.getResidents(),
      payments: this.http.get<Payment[]>(`${this.apiBaseUrl}/payments`, { context: silentContext }),
    });
  }
}
