import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, ParamMap, provideRouter, convertToParamMap } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { ExpenseApiService } from '../../../core/services/api/expense-api.service';
import { Expense } from '../../../shared/models/expense.model';
import { ExpenseDetailsComponent } from './expense-details';

describe('ExpenseDetailsComponent', () => {
  let fixture: ComponentFixture<ExpenseDetailsComponent>;
  let component: ExpenseDetailsComponent;
  let routeParams: BehaviorSubject<ParamMap>;
  let requests: Map<string, Subject<Expense>>;
  let getExpenseById: jasmine.Spy;

  beforeEach(async () => {
    routeParams = new BehaviorSubject(convertToParamMap({ id: 'first' }));
    requests = new Map<string, Subject<Expense>>();
    getExpenseById = jasmine.createSpy('getExpenseById').and.callFake((id: string) => {
      const request = new Subject<Expense>();
      requests.set(id, request);
      return request.asObservable();
    });

    await TestBed.configureTestingModule({
      imports: [ExpenseDetailsComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { paramMap: routeParams.asObservable() },
        },
        {
          provide: ExpenseApiService,
          useValue: { getExpenseById },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the expense for the latest route id if an earlier request finishes later', () => {
    const firstExpense = {
      id: 'first',
      title: 'First expense',
      category: 'Maintenance',
      amount: 100,
      spentAt: '2026-11-01',
    };
    const secondExpense = {
      id: 'second',
      title: 'Second expense',
      category: 'Electricity',
      amount: 200,
      spentAt: '2026-11-02',
    };

    routeParams.next(convertToParamMap({ id: 'second' }));

    requests.get('second')?.next(secondExpense);
    requests.get('first')?.next(firstExpense);
    fixture.detectChanges();

    expect(getExpenseById).toHaveBeenCalledWith('first');
    expect(getExpenseById).toHaveBeenCalledWith('second');
    expect(component.expense()).toEqual(secondExpense);
    expect(fixture.nativeElement.textContent).toContain('Second expense');
    expect(fixture.nativeElement.textContent).not.toContain('First expense');
  });
});
