import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { ExpenseApiService } from './expense-api.service';
import { Expense } from '../../../shared/models/expense.model';
import { ExpenseStoreService } from './expense-store.service';

describe('ExpenseStore', () => {
  let store: ExpenseStoreService;

  // Provides sample expense data that will be returned
  // by the mocked ExpenseApiService during testing.
  const mockExpenses: Expense[] = [
    {
      id: 1,
      title: 'Electricity Bill',
      category: 'Electricity',
      amount: 5000,
      spentAt: '2026-11-01',
      description: 'Monthly electricity bill',
      references: [],
    },
  ];

  // Creates a mock API service to isolate the store from actual HTTP requests.
  // getExpenses() returns an Observable containing the sample expense data.
  const expenseApiServiceMock = {
    //getExpenses: jasmine.createSpy('getExpenses').and.returnValue(of(mockExpenses)),

    getExpenses: jasmine.createSpy('getExpenses'),

    addExpense: jasmine.createSpy('addExpense'),

    updateExpense: jasmine.createSpy('updateExpense'),

    deleteExpense: jasmine.createSpy('deleteExpense'),
  };

  // Configure Angular's testing module before each test.
  // Provide the actual store service and replace its API dependency
  // with the mock implementation.
  // beforeEach(() => {
  //   TestBed.configureTestingModule({
  //     providers: [
  //       ExpenseStoreService,
  //       {
  //         provide: ExpenseApiService,
  //         useValue: expenseApiServiceMock,
  //       },
  //     ],
  //   });

  //   // Retrieve an instance of ExpenseStoreService from Angular's
  //   // dependency injection system.
  //   store = TestBed.inject(ExpenseStoreService);
  // });
  beforeEach(() => {
    expenseApiServiceMock.getExpenses.calls.reset();
    expenseApiServiceMock.addExpense.calls.reset();
    expenseApiServiceMock.updateExpense.calls.reset();
    expenseApiServiceMock.deleteExpense.calls.reset();

    expenseApiServiceMock.getExpenses.and.returnValue(of(mockExpenses));

    TestBed.configureTestingModule({
      providers: [
        ExpenseStoreService,
        {
          provide: ExpenseApiService,
          useValue: expenseApiServiceMock,
        },
      ],
    });

    store = TestBed.inject(ExpenseStoreService);
  });

  // Verify that Angular can successfully create the expense store.
  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  // Verify that the store successfully loads expenses from the API
  // and updates its Signals with the returned data.
  it('should load expenses successfully', () => {
    // Arrange: Confirm that the expense list is initially empty.
    //expect(store.expenses()).toEqual([]);
    const newExpense: Expense = {
      id: 2,
      title: 'Water Bill',
      category: 'Water',
      amount: 2000,
      spentAt: '2026-11-05',
      description: 'Monthly water bill',
      references: [],
    };

    // Load initial data into the store.
    store.loadExpenses();

    // Act: Trigger the expense-loading operation.
    store.addExpense(newExpense);

    // Assert: Verify that the API service was called.
    expect(expenseApiServiceMock.getExpenses).toHaveBeenCalled();

    // Verify that the store contains the expenses returned by the mocked API.
    expect(store.expenses()).toEqual(mockExpenses);

    // Verify that the loading state is reset after the API response.
    expect(store.isLoading()).toBeFalse();
    expect(store.expenses()).toContain(newExpense);
    expect(store.expenses()).toHaveSize(2);
  });

  it('should handle an error when loading expenses fails', () => {
    // Arrange
    const error = new Error('Unable to load expenses');

    expenseApiServiceMock.getExpenses.and.returnValue(throwError(() => error));

    // Act
    store.loadExpenses();

    // Assert
    expect(expenseApiServiceMock.getExpenses).toHaveBeenCalled();

    expect(store.expenses()).toEqual([]);
    expect(store.isLoading()).toBeFalse();

    expect(store.errorMessage()).toBe('Unable to load expenses. Please try again.');
  });

  it('should update an existing expense', () => {
    // Arrange
    store.loadExpenses();

    const updatedExpense: Expense = {
      ...mockExpenses[0],
      amount: 6500,
      description: 'Updated electricity bill',
    };

    // Act
    store.updateExpense(updatedExpense);

    // Assert
    const expense = store.expenses().find((item) => item.id === updatedExpense.id);

    expect(expense).toEqual(updatedExpense);
    expect(expense?.amount).toBe(6500);
  });

  it('should remove an expense', () => {
    // Arrange
    store.loadExpenses();

    expect(store.expenses()).toHaveSize(1);

    // Act
    store.removeExpense(mockExpenses[0].id);

    // Assert
    expect(store.expenses()).toEqual([]);
  });
});
