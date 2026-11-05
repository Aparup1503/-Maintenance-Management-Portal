import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardComponent } from './dashboard';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should count only received payments in total collection', () => {
    expect(component.totalCollection()).toBe(
      component.data
        .payments()
        .filter((payment) => payment.status === 'Paid')
        .reduce((total, payment) => total + payment.amount, 0),
    );
  });
});
