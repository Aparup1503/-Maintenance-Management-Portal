import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validates that a text field contains at least one non-whitespace character.
 */
export function notBlankValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    // Allow the required validator to handle empty values.
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // Return a validation error when the value contains only whitespace.
    return value.trim().length === 0 ? { blank: true } : null;
  };
}
