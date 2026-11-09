import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { Expense } from '../../../shared/models/expense.model';
import { ExpenseDetailsComponent } from './expense-details';

describe('ExpenseDetailsComponent', () => {
  let fixture: ComponentFixture<ExpenseDetailsComponent>;
  let component: ExpenseDetailsComponent;
  let routeData: BehaviorSubject<Record<string, unknown>>;

  beforeEach(async () => {
    routeData = new BehaviorSubject<Record<string, unknown>>({
      expense: {
        id: 'first',
        title: 'First expense',
        category: 'Maintenance',
        amount: 100,
        spentAt: '2026-11-01',
      } satisfies Expense,
    });

    await TestBed.configureTestingModule({
      imports: [ExpenseDetailsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { data: routeData.asObservable() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the expense resolved by the route', () => {
    const secondExpense = {
      id: 'second',
      title: 'Second expense',
      category: 'Electricity',
      amount: 200,
      spentAt: '2026-11-02',
    } satisfies Expense;

    routeData.next({ expense: secondExpense });
    fixture.detectChanges();

    expect(component.expense()).toEqual(secondExpense);
    expect(fixture.nativeElement.textContent).toContain('Second expense');
    expect(fixture.nativeElement.textContent).not.toContain('First expense');
  });
});
