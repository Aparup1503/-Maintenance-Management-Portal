import {
  Component,
  DestroyRef,
  computed,
  inject,
  viewChild,
  viewChildren,
  afterNextRender,
  OnInit,
  AfterViewInit,
  signal,
  ElementRef,
  afterRenderEffect,
} from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Expense } from '../../shared/models/expense.model';
import { ExpenseApiService } from '../../core/services/api/expense-api.service';
import { ExpenseCardComponent } from './components/expense-card/expense-card';
import { ExpenseStoreService } from '../../core/services/state/expense-store.service';
import { AppCardComponent } from '../../shared/components/app-card/app-card';
import { notBlankValidator } from '../../shared/validators/not-blank.validator';

@Component({
  selector: 'app-expenses',
  imports: [CurrencyPipe, ReactiveFormsModule, ExpenseCardComponent, AppCardComponent],
  templateUrl: './expenses.html',
  styleUrl: './expenses.scss',
})
export class ExpensesComponent implements OnInit, AfterViewInit {
  //API service responsible for HTTP communication.
  private readonly expenseApiService = inject(ExpenseApiService);

  //DestroyRef allows Angular to automatically clean up.
  // Observable subscriptions when the component is destroyed.
  private readonly destroyRef = inject(DestroyRef);

  private readonly fb = inject(FormBuilder);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly expenseStore = inject(ExpenseStoreService);

  // Reads expense data from the shared Expense Store.
  readonly expenses = this.expenseStore.expenses;

  //Gets a reference to the expense form container after Angular renders it.
  private readonly expenseFormSection = viewChild<ElementRef<HTMLElement>>('expenseFormSection');

  private readonly pageHeader = viewChild<ElementRef<HTMLElement>>('pageHeader');

  // Gets all currently rendered ExpenseCardComponent instances.
  private readonly expenseCards = viewChildren(ExpenseCardComponent);

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

  // Admin role simulation
  readonly isAdmin = signal(true);

  // Add Expense form visibility
  readonly showAddForm = signal(false);

  // Converts Angular Router query parameters from an Observable
  // into a Signal so they can be used with Angular's Signals API.
  private readonly queryParamMap = toSignal(this.activatedRoute.queryParamMap);

  // constructor() {
  //   afterRenderEffect(() => {
  //     const header = this.pageHeader();

  //     if (!header) {
  //       return;
  //     }

  //     console.log('Page header:', header.nativeElement);
  //   });
  // }

  // Emits search text whenever the user changes the search input.
  //private readonly searchSubject = new Subject<string>();

  ngOnInit(): void {
    // Load expenses when the feature is initialized.
    this.loadExpenses();
  }

  ngAfterViewInit(): void {
    console.log(this.pageHeader()?.nativeElement);
  }
  getVisibleExpenseCardCount(): number {
    // Returns the number of ExpenseCard components currently rendered.
    return this.expenseCards().length;
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
        //Store the API response in the shared state.
        this.expenseStore.setExpenses(expenses);
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
          this.expenseStore.removeExpense(expense.id);
          this.deletingExpenseId.set(null);
        },

        error: (error) => {
          console.error('Unable to delete expense.', error);
          this.errorMessage.set('Unable to delete expense. Please try again.');
          this.deletingExpenseId.set(null);
        },
      });
  }

  readonly editingExpenseId = signal<string | number | null>(null);

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
    title: [
      '',
      [
        Validators.required,
        notBlankValidator(), // Custom validator to prevent whitespace-only input.
        Validators.minLength(3),
        Validators.maxLength(100),
      ],
    ],

    category: ['Electricuty', Validators.required],

    amount: [0, [Validators.required, Validators.min(1)]],

    spentAt: [new Date().toISOString().slice(0, 10), Validators.required],

    description: ['', Validators.maxLength(250)],

    // Dynamic list of supporting references that users can add or remove.
    references: this.fb.nonNullable.array<string>([]),
  });
  // Available categories
  readonly categories = computed(() => [
    'All',
    ...new Set(this.expenses().map((expense) => expense.category)),
  ]);

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    // Update the local UI search state.
    // filteredExpenses() automatically recalculates.
    this.searchText.set(value);
  }

  onCategoryChange(event: Event): void {
    const category = (event.target as HTMLSelectElement).value;

    // Update the selected category used by the UI filter.
    //this.selectedCategory.set(category);

    // Keep the selected category synchronized with the URL.
    this.router.navigate([], {
      relativeTo: this.activatedRoute,

      queryParams: {
        category: category === 'All' ? null : category,
      },

      // Preserve other query parameters if we add search,
      // pagination, or sorting parameters later.
      queryParamsHandling: 'merge',
    });
  }

  // Provides easy access to the dynamic references FormArray.
  get references(): FormArray<FormControl<string>> {
    return this.expenseForm.controls.references;
  }

  // Adds a new non-nullable string FormControl to the references FormArray.
  // Each reference is required and cannot exceed 100 characters.
  addReference(): void {
    this.references.push(
      this.fb.nonNullable.control('', [
        Validators.required,
        notBlankValidator(), // Prevents users from entering whitespace-only references.
        Validators.maxLength(100),
      ]),
    );
  }

  // Removes the reference FormControl at the specified index
  // from the references FormArray.
  removeReference(index: number): void {
    this.references.removeAt(index);
  }
  //$ Filter expenses reactively
  readonly filteredExpenses = computed(() => {
    console.log('Filtering expenses...');

    const search = this.searchText().trim().toLowerCase();
    const category = this.selectedCategory();

    return this.expenses().filter((expense) => {
      const matchesSearch =
        search === '' ||
        expense.title.toLowerCase().includes(search) ||
        expense.category.toLowerCase().includes(search);

      const matchesCategory = category === 'All' || expense.category === category;

      return matchesSearch && matchesCategory;
    });
  });

  // Derives the selected category directly from the URL.
  // When the query parameter changes, this value updates automatically.
  readonly selectedCategory = computed(() => {
    return this.queryParamMap()?.get('category') ?? 'All';
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
    this.references.clear();

    this.showAddForm.set(true);
    // Scroll to the newly opened form.
    setTimeout(() => {
      this.expenseFormSection()?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
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

    // Remove references belonging to the previously edited expense.
    this.references.clear();

    // Recreate a FormControl for each saved reference.
    expense.references?.forEach((reference) => {
      this.references.push(
        this.fb.nonNullable.control(reference, [
          Validators.required,
          notBlankValidator(),
          Validators.maxLength(100),
        ]),
      );
    });

    this.showAddForm.set(true);

    // Schedules the scroll operation to run in a later JavaScript task.
    // This gives Angular an opportunity to render the form before we access
    // its DOM element. However, it relies on timing rather than Angular's
    // rendering lifecycle, so it is less explicit and predictable.
    setTimeout(() => {
      this.expenseFormSection()?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });

    //^Recomended Approach
    // Registers a callback to run after Angular completes the next render cycle.
    // Since showAddForm was set to true, Angular will render the form first.
    // The callback can then safely access the form's DOM element and scroll to it.
    // afterNextRender(() => {
    //   this.expenseFormSection()?.nativeElement.scrollIntoView({
    //     behavior: 'smooth',
    //     block: 'start',
    //   });
    // });
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

      // Remove extra spaces and exclude empty reference values.
      references: formValue.references
        .map((reference) => reference.trim())
        .filter((reference) => reference.length > 0),
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
          this.expenseStore.updateExpense(savedExpense);
        } else {
          // Add the newly created expense to the Signal.
          this.expenseStore.addExpense(savedExpense);
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
}
