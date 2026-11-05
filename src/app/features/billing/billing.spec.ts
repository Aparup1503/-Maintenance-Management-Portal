import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingComponent } from './billing';

describe('BillingComponent', () => {
  let component: BillingComponent;
  let fixture: ComponentFixture<BillingComponent>;

  beforeEach(async () => {
    localStorage.removeItem('maintenance-portal-data');

    await TestBed.configureTestingModule({
      imports: [BillingComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(BillingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show three pending bills for November 2026', () => {
    expect(component.pendingCount()).toBe(3);
    expect(component.filteredBills().filter((bill) => bill.status === 'Pending').length).toBe(3);
  });
});
