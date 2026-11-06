import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validates the relationship between billing period dates.
 *
 * Rules:
 * 1. Period end date must be after the period start date.
 * 2. Due date cannot be before the billing period ends.
 */
export function billingPeriodValidator(): ValidatorFn {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const startDate = formGroup.get('periodStart')?.value;
    const endDate = formGroup.get('periodEnd')?.value;
    const dueDate = formGroup.get('dueDate')?.value;

    // Individual required validators handle missing values.
    if (!startDate || !endDate || !dueDate) {
      return null;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const due = new Date(dueDate);

    if (end < start) {
      return { invalidBillingPeriod: true };
    }

    if (due < end) {
      return { invalidDueDate: true };
    }

    return null;
  };
}
