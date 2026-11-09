import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DashboardApiService } from '../../core/services/api/dashboard-api.service';
import { DashboardComponent } from './dashboard';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    const dashboardApi = {
      getDashboardData: () =>
        of({
          expenses: [],
          bills: [],
          residents: [],
          payments: [
            {
              id: 1,
              residentId: 1,
              amount: 1200,
              paymentDate: '2026-11-02',
              spentAt: '2026-11-02',
              month: 'November 2026',
              status: 'Paid' as const,
            },
            {
              id: 2,
              residentId: 2,
              amount: 700,
              paymentDate: '',
              spentAt: '',
              month: 'November 2026',
              status: 'Pending' as const,
            },
          ],
        }),
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        { provide: DashboardApiService, useValue: dashboardApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should count only received payments in total collection', () => {
    expect(component.totalCollection()).toBe(1200);
  });

  it('should always show the resident management shortcut', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('a[routerLink="/residents"]')).toBeTruthy();
  });
});
