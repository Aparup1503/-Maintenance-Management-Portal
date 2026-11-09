import { HttpContextToken } from '@angular/common/http';

/**
 * Controls whether HTTP request logging should be skipped.
 *
 * Default value is false, which means requests are logged normally.
 */
export const SKIP_HTTP_LOGGING = new HttpContextToken<boolean>(() => false);
