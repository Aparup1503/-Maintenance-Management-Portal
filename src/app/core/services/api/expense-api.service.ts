import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { APP_CONFIG } from '../../config/app-config.token';

//~Adjust this import path to match the Expense model already present in your project.
import { Expense } from '../../../shared/models/expense.model';

@Injectable({
  providedIn: 'root',
})
export class ExpenseApiService {
  //~Angular injects HttpClient for making HTTP requests.
  private readonly http = inject(HttpClient);

  //~Application configuration provides the API base URL.
  //~The service does not hardcode environment-specific URLs.
  private readonly appConfig = inject(APP_CONFIG);

  private readonly apiUrl = `${this.appConfig.apiBaseUrl}/expenses`;

  getExpenses(): Observable<Expense[]> {
    //~ HttpClient returns an Observable.
    //~ The HTTP request is executed when the Observable
    //~ is subscribed to.
    return this.http.get<Expense[]>(this.apiUrl);
  }

  addExpense(expense: Omit<Expense, 'id'>): Observable<Expense> {
    //~ Sends a POST request to create a new expense.
    //~ json-server generates and returns the new expense.
    return this.http.post<Expense>(this.apiUrl, expense);
  }

  updateExpense(id: string | number, expense: Partial<Expense>): Observable<Expense> {
    //~ PATCH updates only the fields sent in the request.
    return this.http.patch<Expense>(`${this.apiUrl}/${id}`, expense);
  }

  deleteExpense(id: string | number): Observable<void> {
    //~  Sends a DELETE request to remove the expense
    //~  from the API data source.
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // searchExpenses(searchText: string): Observable<Expense[]> {
  //   //~ json-server supports query parameters for filtering.
  //   return this.http.get<Expense[]>(this.apiUrl, {
  //     params: {
  //       q: searchText,
  //     },
  //   });
  // }

  searchExpenses(searchText: string): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl).pipe(
      map((expenses) => {
        const search = searchText.trim().toLowerCase();

        return expenses.filter(
          (expense) =>
            expense.title.toLowerCase().includes(search) ||
            expense.category.toLowerCase().includes(search),
        );
      }),
    );
  }
}
