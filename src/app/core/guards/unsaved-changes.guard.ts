import { CanDeactivateFn } from '@angular/router'; //^Angular functional guard type

/**
 * Defines the minimum contract required for components
 * that need unsaved changes protection.
 */
export interface CanComponentDeactivate {
  canDeactivate: () => boolean;
}

/**
 * Prevents navigation when the current component has unsaved changes.
 */
export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  return component.canDeactivate();
};
