import {
  Component,
  DestroyRef,
  computed,
  inject,
  Injector,
  viewChild,
  viewChildren,
  afterNextRender,
  OnInit,
  AfterViewInit,
  signal,
  effect,
  EffectRef,
  ElementRef,
  afterRenderEffect,
  untracked,
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
import { takeUntilDestroyed, toSignal, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { Expense } from '../../shared/models/expense.model';
import { ExpenseApiService } from './data-access/expense-api.service';
import { ExpenseCardComponent } from './components/expense-card/expense-card';
import { ExpenseStoreService } from './data-access/expense-store.service';
import { AppCardComponent } from '../../shared/components/app-card/app-card';
import { notBlankValidator } from '../../shared/validators/not-blank.validator';
import { uniqueExpenseTitleValidator } from '../../shared/validators/unique-expense-title.validator';
import { UserRoleService } from '../../core/services/user-role.service';
import { Title } from '@angular/platform-browser';
import { ExpenseAnalyticsComponent } from './components/expense-analytics/expense-analytics';

@Component({
  selector: 'app-expenses',
  imports: [
    CurrencyPipe,
    ReactiveFormsModule,
    ExpenseCardComponent,
    AppCardComponent,
    ExpenseAnalyticsComponent,
  ],
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
  private readonly userRoleService = inject(UserRoleService);
  private readonly titleService = inject(Title);
  private categoryTrackingEffect?: EffectRef;
  private readonly injector = inject(Injector);

  //readonly expenses = this.expenseStateService.expenses;
  // Reads expense data from the shared Expense Store.
  readonly expenses = this.expenseStore.expenses;

  //Gets a reference to the expense form container after Angular renders it.
  private readonly expenseFormSection = viewChild<ElementRef<HTMLElement>>('expenseFormSection');

  private readonly pageHeader = viewChild<ElementRef<HTMLElement>>('pageHeader');

  // Gets all currently rendered ExpenseCardComponent instances.
  private readonly expenseCards = viewChildren(ExpenseCardComponent);

  // Operation states are managed by the shared Expense Store.
  readonly isSaving = this.expenseStore.isSaving;

  readonly deletingExpenseId = this.expenseStore.deletingExpenseId;

  // Loading and error states are also managed by the store.
  readonly isLoading = this.expenseStore.isLoading;
  readonly errorMessage = this.expenseStore.errorMessage;

  // Reactive search state
  readonly searchText = signal('');

  // Exposes the shared role state to the template.
  readonly isAdmin = this.userRoleService.isAdmin;

  // Add Expense form visibility
  readonly showAddForm = signal(false);

  readonly hasUnsavedChanges = signal(false);

  readonly apiSearchResults = signal<Expense[]>([]);

  readonly notification = signal<string | null>(null);

  // Converts Angular Router query parameters from an Observable
  // into a Signal so they can be used with Angular's Signals API.
  private readonly queryParamMap = toSignal(this.activatedRoute.queryParamMap);

  readonly searchText$ = toObservable(this.searchText);

  readonly debouncedSearch$ = this.searchText$.pipe(debounceTime(300), distinctUntilChanged());

  constructor() {
    effect(() => {
      // This signal IS tracked.
      const category = this.selectedCategory();

      // This signal is read but NOT tracked.
      const currentSearch = untracked(() => this.searchText());

      console.log('Category analytics:', {
        category,
        currentSearch,
      });
    });

    effect(() => {
      const category = this.selectedCategory();

      console.log('Selected category changed:', category);

      // Keep the browser tab title synchronized with the selected category.
      // Display a general title when all categories are selected;
      // otherwise, include the currently selected category in the title.
      document.title =
        category === 'All'
          ? 'Expenses | Maintenance Portal'
          : `Expenses - ${category} | Maintenance Portal`;
    });

    effect((onCleanup) => {
      // Angular tracks notification as a dependency.
      const message = this.notification();

      if (!message) {
        return;
      }

      // Automatically clear the notification after 5 seconds.
      const timeoutId = setTimeout(() => {
        this.notification.set(null);
      }, 5000);

      // Register cleanup logic to cancel the previous timer
      // before this effect reruns or when the effect is destroyed.
      // This prevents outdated timers from clearing newer notifications.
      onCleanup(() => {
        clearTimeout(timeoutId);
      });
    });

    this.expenseForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      // Mark the form as changed after the user modifies a value.
      this.hasUnsavedChanges.set(this.expenseForm.dirty);
    });
    this.expenseForm.statusChanges.subscribe((status) => {
      console.log('Form status:', status);
    });

    // this.debouncedSearch$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((searchText) => {
    //   console.log('Debounced search:', searchText);
    // });

    this.searchSubject
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((searchText) => this.expenseApiService.searchExpenses(searchText)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (expenses) => {
          console.log('Search results:', expenses);

          // We'll connect these results to the UI in the next step.
        },
        error: (error) => {
          console.error('Search failed:', error);
        },
      });

    this.searchExpenses$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((expenses) => {
      this.apiSearchResults.set(expenses);

      console.log('API search results:', expenses);
    });
  }

  // Emits search text whenever the user changes the search input.
  private readonly searchSubject = new Subject<string>();

  ngOnInit(): void {
    // Load expenses when the feature is initialized.
    this.expenseStore.loadExpenses();
  }

  ngAfterViewInit(): void {
    console.log(this.pageHeader()?.nativeElement);
  }
  getVisibleExpenseCardCount(): number {
    // Returns the number of ExpenseCard components currently rendered.
    return this.expenseCards().length;
  }

  deleteExpense(expense: Expense): void {
    // The component handles user interaction.
    const confirmed = window.confirm(`Are you sure you want to delete "${expense.title}"?`);

    if (!confirmed) {
      return;
    }

    // The store handles the API call and shared state update.
    this.expenseStore.deleteExpense(expense.id);
    this.notification.set(`Expense ${expense.id} deleted successfully!`);
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

  //Typed Reactive Forms
  readonly expenseForm = this.fb.nonNullable.group({
    // Title field with synchronous and asynchronous validation.
    title: this.fb.nonNullable.control('', {
      // Runs immediately whenever the control value changes.
      validators: [
        Validators.required,
        notBlankValidator(),
        Validators.minLength(3),
        Validators.maxLength(100),
      ],

      // Checks whether the expense title already exists.
      asyncValidators: [
        uniqueExpenseTitleValidator(this.expenseApiService, () => this.editingExpenseId()),
      ],

      // Runs validation after the user leaves the title field.
      updateOn: 'blur',
    }),

    category: ['Electricuty', Validators.required],

    amount: [0, [Validators.required, Validators.min(1)]],

    spentAt: [new Date().toISOString().slice(0, 10), Validators.required],

    description: ['', Validators.maxLength(250)],

    // Dynamic list of non-nullable string controls.
    references: this.fb.nonNullable.array<string>([]),
  });
  // Available categories
  readonly categories = computed(() => [
    'All',
    ...new Set(this.expenses().map((expense) => expense.category)),
  ]);

  readonly searchExpenses$ = toObservable(this.searchText).pipe(
    debounceTime(300),
    distinctUntilChanged(),

    switchMap((searchText) => {
      const search = searchText.trim();

      // If search is empty, don't call the API.
      if (!search) {
        return of([]);
      }

      return this.expenseApiService.searchExpenses(search).pipe(
        catchError((error) => {
          console.error('Unable to search expenses.', error);
          return of([]);
        }),
      );
    }),
  );
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    // Update the local UI search state.
    // filteredExpenses() automatically recalculates.
    this.searchText.set(value);
    this.searchSubject.next(value);
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
    this.editingExpenseId.set(null);
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

    // Run the async validator using the current expense ID.
    this.expenseForm.controls.title.updateValueAndValidity();

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
    // this.expenseForm.reset({
    //   title: '',
    //   category: 'Electricity',
    //   amount: 0,
    //   spentAt: new Date().toISOString().slice(0, 10),
    //   description: '',
    // });
    this.expenseForm.reset();
    this.hasUnsavedChanges.set(false);
    this.expenseForm.reset();
    this.references.clear();
  }

  //$ Submit expense
  onSubmitExpense(): void {
    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      return;
    }

    const formValue = this.expenseForm.getRawValue();

    const expenseData = {
      title: formValue.title.trim(),
      category: formValue.category,
      amount: formValue.amount,
      spentAt: formValue.spentAt,
      description: formValue.description.trim(),
      references: formValue.references.map((reference) => reference.trim()).filter(Boolean),
    };

    const editingId = this.editingExpenseId();

    if (editingId !== null) {
      // EDIT: Component delegates the API operation to the store.
      this.expenseStore.saveExpense(editingId, expenseData, () => {
        this.notification.set('Expense updated successfully!');
        this.closeAddExpenseForm();
      });
    } else {
      // ADD: Component delegates the API operation to the store.
      this.expenseStore.createExpense(expenseData, () => {
        this.notification.set('Expense added successfully!');
        this.closeAddExpenseForm();
      });
    }
  }

  /**
   * Checks whether the user can safely leave the Expenses page.
   */
  canDeactivate(): boolean {
    // No form is currently open, so navigation is safe.
    if (!this.showAddForm()) {
      return true;
    }

    // The form has not been modified, so navigation is safe.
    if (!this.expenseForm.dirty) {
      return true;
    }

    // Ask the user before discarding unsaved changes.
    return window.confirm('You have unsaved changes. Are you sure you want to leave this page?');
  }

  startCategoryTracking(): void {
    // Prevent creating multiple tracking effects.
    if (this.categoryTrackingEffect) {
      return;
    }

    this.categoryTrackingEffect = effect(
      () => {
        console.log('Category tracking:', this.selectedCategory());
      },
      {
        injector: this.injector,
      },
    );
  }

  stopCategoryTracking(): void {
    this.categoryTrackingEffect?.destroy();

    this.categoryTrackingEffect = undefined;

    console.log('Category tracking stopped.');
  }

  demonstrateImmutableUpdate(): void {
    const originalExpense = {
      id: 999,
      title: 'Demo Expense',
      amount: 1000,
    };

    // ❌ Mutation: same object reference
    const mutatedExpense = originalExpense;
    mutatedExpense.amount = 2000;

    console.log('Mutation - same reference:', originalExpense === mutatedExpense);

    // Reset example with a fresh object.
    const anotherExpense = {
      id: 999,
      title: 'Demo Expense',
      amount: 1000,
    };

    // ✅ Immutable update: new object reference
    const immutableExpense = {
      ...anotherExpense,
      amount: 2000,
    };

    console.log('Immutable - same reference:', anotherExpense === immutableExpense);

    console.log('Original:', anotherExpense);
    console.log('Updated:', immutableExpense);
  }

  refreshExpenses(): void {
    this.expenseStore.loadExpenses();
  }
}
