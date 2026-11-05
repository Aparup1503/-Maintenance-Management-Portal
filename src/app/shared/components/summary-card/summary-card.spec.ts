import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryCard } from './summary-card';

describe('SummaryCard', () => {
  let component: SummaryCard;
  let fixture: ComponentFixture<SummaryCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryCard);
    fixture.componentRef.setInput('title', 'Monthly Collection');
    fixture.componentRef.setInput('amount', 125000);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should visibly select the card when its checkbox is checked', () => {
    const checkbox = fixture.nativeElement.querySelector(
      'input[type="checkbox"]'
    ) as HTMLInputElement;

    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(component.selected()).toBeTrue();
    expect(fixture.nativeElement.querySelector('.card-content').classList)
      .toContain('is-selected');
    expect(fixture.nativeElement.querySelector('label').textContent)
      .toContain('Selected');
  });
});
