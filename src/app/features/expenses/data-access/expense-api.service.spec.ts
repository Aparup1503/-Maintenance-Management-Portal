import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { ExpenseApiService } from './expense-api.service';
import { Expense } from '../../../shared/models/expense.model';
import { APP_CONFIG } from '../../../core/config/app-config.token';

describe('ExpenseApiService', () => {
  let service: ExpenseApiService;
  let httpTesting: HttpTestingController;

  const apiBaseUrl = 'http://localhost:3000';

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

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ExpenseApiService,

        // Provides HttpClient.
        provideHttpClient(),

        // Replaces real HTTP calls with a testing backend.
        provideHttpClientTesting(),

        // Provides the configuration required by ExpenseApiService.
        {
          provide: APP_CONFIG,
          useValue: {
            apiBaseUrl,
          },
        },
      ],
    });

    service = TestBed.inject(ExpenseApiService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Ensures no unexpected HTTP requests remain.
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('should retrieve all expenses', () => {
    // Arrange + Act
    service.getExpenses().subscribe((expenses) => {
      // Assert the response received by the service.
      expect(expenses).toEqual(mockExpenses);
    });

    // Find the outgoing HTTP request.
    const request = httpTesting.expectOne(`${apiBaseUrl}/expenses`);

    // Verify the HTTP method.
    expect(request.request.method).toBe('GET');

    // Send a fake response.
    request.flush(mockExpenses);
  });

  it('should retrieve an expense by id', () => {
    const expenseId = 1;

    service.getExpenseById(expenseId).subscribe((expense) => {
      expect(expense).toEqual(mockExpenses[0]);
    });

    const request = httpTesting.expectOne(`${apiBaseUrl}/expenses/${expenseId}`);

    expect(request.request.method).toBe('GET');

    request.flush(mockExpenses[0]);
  });
  it('should add a new expense', () => {
    const newExpense = {
      title: 'Water Bill',
      category: 'Water',
      amount: 2000,
      spentAt: '2026-11-05',
      description: 'Monthly water bill',
      references: [],
    };

    const createdExpense: Expense = {
      id: 2,
      ...newExpense,
    };

    service.addExpense(newExpense).subscribe((expense) => {
      expect(expense).toEqual(createdExpense);
    });

    const request = httpTesting.expectOne(`${apiBaseUrl}/expenses`);

    expect(request.request.method).toBe('POST');

    // Verify the request body.
    expect(request.request.body).toEqual(newExpense);

    request.flush(createdExpense);
  });
  it('should update an expense', () => {
    const expenseId = 1;

    const updatedData = {
      amount: 6000,
      description: 'Updated electricity bill',
    };

    const updatedExpense: Expense = {
      ...mockExpenses[0],
      ...updatedData,
    };

    service.updateExpense(expenseId, updatedData).subscribe((expense) => {
      expect(expense).toEqual(updatedExpense);
    });

    const request = httpTesting.expectOne(`${apiBaseUrl}/expenses/${expenseId}`);

    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual(updatedData);

    request.flush(updatedExpense);
  });
  it('should delete an expense', () => {
    const expenseId = 1;

    service.deleteExpense(expenseId).subscribe(() => {
      expect(true).toBeTrue();
    });

    const request = httpTesting.expectOne(`${apiBaseUrl}/expenses/${expenseId}`);

    expect(request.request.method).toBe('DELETE');

    request.flush(null);
  });
});
