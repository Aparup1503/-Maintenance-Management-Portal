import { Component, DestroyRef, computed, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  of,
  tap,
  switchMap,
  map,
  finalize,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MaintenanceDataService } from '../../core/services/maintenance-data.service';
import { FormBuilder, Validators } from '@angular/forms';
import { Expense } from '../../shared/models/expense.model';
import { ExpenseApiService } from '../../core/services/api/expense-api.service';

@Component({
  selector: 'app-expenses',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss',
})
export class ExpensesComponent implements OnInit {
  //API service responsible for HTTP communication.
  private readonly expenseApiService = inject(ExpenseApiService);

  readonly data = inject(MaintenanceDataService);
  //DestroyRef allows Angular to automatically clean up.
  // Observable subscriptions when the component is destroyed.
  private readonly destroyRef = inject(DestroyRef);

  private readonly fb = inject(FormBuilder);

  // Signal containing expenses received from the API.
  readonly expenses = signal<Expense[]>([]);

  // Tracks the Add Expense API request.
  readonly isSaving = signal(false);

  // Stores the ID of the expense currently being deleted.
  // This helps us show a loading state for that specific row.
  readonly deletingExpenseId = signal<string | number | null>(null);
  //  UI state signals.
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  // Reactive search state
  readonly searchText = signal('');

  // Reactive category filter
  readonly selectedCategory = signal('All');

  // Admin role simulation
  readonly isAdmin = signal(true);

  // Add Expense form visibility
  readonly showAddForm = signal(false);

  // Emits search text whenever the user changes the search input.
  private readonly searchSubject = new Subject<string>();

  ngOnInit(): void {
    // Load expenses when the feature is initialized.
    this.loadExpenses();

    // Initialize the RxJS search pipeline once.
    // The pipeline remains subscribed and listens for search values
    // emitted through searchSubject whenever the user types.
    this.setupExpenseSearch();
  }

  loadExpenses(): void {
    // Update the UI to show the loading state.
    this.isLoading.set(true);

    // Clear any previous error before making a new request.
    this.errorMessage.set(null);

    this.expenseApiService
      .getExpenses()
      .pipe(
        map((expenses) =>
          [...expenses].sort(
            (a, b) => new Date(b.spentAt).getTime() - new Date(a.spentAt).getTime(),
          ),
        ),
        // Performs a side effect without changing the API response.
        tap((expenses) => {
          console.log('Expenses loaded:', expenses.length);
        }),

        // Handles API errors inside the Observable pipeline.
        catchError((error) => {
          console.error('Unable to load expenses.', error);

          this.errorMessage.set('Unable to load expenses. Please try again.');

          // Return an empty array so the Observable can complete safely.
          return of([]);
        }),
        // Runs when the Observable completes or errors.
        // Perfect for resetting loading indicators.
        finalize(() => {
          this.isLoading.set(false);
        }),
        // Automatically unsubscribes when this component is destroyed.
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((expenses) => {
        // Update the Signal with the final data.
        this.expenses.set(expenses);
      });
  }

  deleteExpense(expense: Expense): void {
    // Ask the user before permanently deleting data.
    const confirmed = window.confirm(`Are you sure you want to delete "${expense.title}"?`);

    if (!confirmed) {
      return;
    }

    //Store the ID so the UI knows which expense is being deleted.
    this.deletingExpenseId.set(expense.id);

    this.errorMessage.set(null);

    this.expenseApiService
      .deleteExpense(expense.id)
      .pipe(
        // Automatically clean up the subscription
        // when the component is destroyed.
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          // Remove the deleted expense from the local Signal.
          // We use filter() to create a new immutable array.
          this.expenses.update((expenses) => expenses.filter((item) => item.id !== expense.id));
          this.deletingExpenseId.set(null);
        },

        error: (error) => {
          console.error('Unable to delete expense.', error);
          this.errorMessage.set('Unable to delete expense. Please try again.');
          this.deletingExpenseId.set(null);
        },
      });
  }

  readonly editingExpenseId = signal<number | null>(null);

  // Expense categories
  readonly expenseCategories = [
    'Electricity',
    'Security',
    'Cleaning',
    'Maintenance',
    'Water',
    'Repairs',
    'Miscellaneous',
  ];

  readonly expenseForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    category: ['Electricuty', Validators.required],
    amount: [0, [Validators.required, Validators.maxLength(1)]],
    spentAt: [new Date().toISOString().slice(0, 10), Validators.required],
    description: ['', Validators.maxLength(250)],
  });
  // Available categories
  readonly categories = computed(() => [
    'All',
    ...new Set(this.expenses().map((expense) => expense.category)),
  ]);

  onSelectionChange(event: Event): void {
    // Convert the event target into an HTMLSelectElement
    const selectElement = event.target as HTMLSelectElement;

    // Update the selected category signal
    this.selectedCategory.set(selectElement.value);

    // Display the updated category in the console
    console.log('Selected Category:', this.selectedCategory());
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    //Keep the existing UI search state updated.
    this.searchText.set(value);

    // Push the latest value into the RxJS stream.
    // Or Emit the latest search value into the existing RxJS pipeline.
    // setupExpenseSearch() has already created and subscribed to this pipeline,
    // so every emitted value flows through debounceTime(),
    // distinctUntilChanged(), and switchMap().
    this.searchSubject.next(value);
  }

  //$ Filter expenses reactively
  readonly filteredExpenses = computed(() => {
    const search = this.searchText().trim().toLowerCase();

    const category = this.selectedCategory();

    return this.expenses().filter((expense) => {
      const matchesSearch =
        expense.title.toLowerCase().includes(search) ||
        expense.category.toLowerCase().includes(search);

      const matchesCategory = category === 'All' || expense.category === category;

      return matchesSearch && matchesCategory;
    });
  });

  // Total expenses
  readonly totalExpenses = computed(() =>
    this.expenses().reduce((total, expense) => total + expense.amount, 0),
  );

  //$ Open form
  openAddExpenseForm(): void {
    this.expenseForm.reset({
      title: '',
      category: 'Electricity',
      amount: 0,
      spentAt: new Date().toISOString().slice(0, 10),
      description: '',
    });

    this.showAddForm.set(true);
  }
  //$ Edit Expense
  editExpense(expense: Expense): void {
    this.editingExpenseId.set(expense.id);

    this.expenseForm.patchValue({
      title: expense.title,
      category: expense.category,
      amount: expense.amount,
      spentAt: expense.spentAt,
      description: expense.description ?? '',
    });

    this.showAddForm.set(true);
  }

  //$ Close form
  closeAddExpenseForm(): void {
    this.showAddForm.set(false);
    this.editingExpenseId.set(null);
    this.expenseForm.reset({
      title: '',
      category: 'Electricity',
      amount: 0,
      spentAt: new Date().toISOString().slice(0, 10),
      description: '',
    });
  }

  //$ Submit expense
  onSubmitExpense(): void {
    // Stop submission if the form is invalid.
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    const formValue = this.expenseForm.getRawValue();

    // Prepare the data that will be sent to the API.
    const expenseData = {
      title: formValue.title.trim(),
      category: formValue.category,
      amount: formValue.amount,
      spentAt: formValue.spentAt,
      description: formValue.description.trim(),
    };

    const expenseId = this.editingExpenseId();
    // Set the saving state while the API request is in progress.
    this.isSaving.set(true);
    this.errorMessage.set(null);

    // Choose POST for a new expense or PATCH for an existing expense.
    const request$ =
      expenseId !== null
        ? this.expenseApiService.updateExpense(expenseId, expenseData)
        : this.expenseApiService.addExpense(expenseData);

    request$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (savedExpense) => {
        if (expenseId !== null) {
          // Replace the updated expense in the Signal.
          this.expenses.update((expenses) =>
            expenses.map((expense) => (expense.id === savedExpense.id ? savedExpense : expense)),
          );
        } else {
          // Add the newly created expense to the Signal.
          this.expenses.update((expenses) => [...expenses, savedExpense]);
        }

        this.isSaving.set(false);

        // Close and reset the form after successful saving.
        this.closeAddExpenseForm();
      },
      error: (error) => {
        console.error('Unable to add expense.', error);

        this.errorMessage.set('Unable to add expense. Please try again.');

        this.isSaving.set(false);
      },
    });
  }

  private setupExpenseSearch(): void {
    // Create the search Observable pipeline once during component initialization.
    // searchSubject does not emit any value here; the pipeline simply waits
    // for values emitted later through searchSubject.next().
    this.searchSubject
      .pipe(
        // Wait until the user stops typing.
        debounceTime(400),

        // Ignore duplicate consecutive search values.
        distinctUntilChanged(),

        // Switch to the latest API request.
        switchMap((searchText) => {
          console.log(searchText);

          //Remove unnecessary whitespace before performing the search.
          if (!searchText.trim()) {
            // If the search is empty, load all expenses.
            return this.expenseApiService.getExpenses();
          }

          return this.expenseApiService.searchExpenses(searchText.trim());
        }),

        // Handle search errors without breaking the stream.
        catchError((error) => {
          console.error('Unable to search expenses.', error);

          this.errorMessage.set('Unable to search expenses. Please try again.');

          return of([]);
        }),

        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((expenses) => {
        // Update the existing Signal with the API result.
        this.expenses.set(expenses);
      });
  }
}
