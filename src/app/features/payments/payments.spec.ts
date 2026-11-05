import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentsComponent } from './payments';

describe('PaymentsComponent', () => {
  let component: PaymentsComponent;
  let fixture: ComponentFixture<PaymentsComponent>;

  beforeEach(async () => {
    localStorage.removeItem('maintenance-portal-data');

    await TestBed.configureTestingModule({
      imports: [PaymentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should include the three pending November 2026 records', () => {
    const pendingPayments = component.filteredPayments().filter((payment) => payment.status === 'Pending');
    expect(pendingPayments.length).toBe(3);

    component.selectedStatus.set('Pending');
    expect(component.filteredPayments().length).toBe(3);
  });
});
