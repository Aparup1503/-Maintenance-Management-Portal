import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Expense } from '../../../../shared/models/expense.model';
import { ExpenseCardComponent } from './expense-card';

describe('ExpenseCardComponent', () => {
  let component: ExpenseCardComponent;
  let fixture: ComponentFixture<ExpenseCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpenseCardComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ExpenseCardComponent);
    component = fixture.componentInstance;
    const expense: Expense = {
      id: 1,
      title: 'Lift Maintenance',
      category: 'Maintenance',
      amount: 1500,
      spentAt: '2026-11-01',
    };
    fixture.componentRef.setInput('expense', expense);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit the selected expense when edited', () => {
    const emittedExpenses: Expense[] = [];
    component.editExpense.subscribe((expense) => emittedExpenses.push(expense));

    component.onEdit();

    expect(emittedExpenses).toEqual([component.expense()]);
  });
});
