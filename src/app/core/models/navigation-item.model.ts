import { UserRole } from './user-role.type';

// Represents a navigation item displayed in the application menu.
export interface NavigationItem {
  // Route path used for navigation.
  path: string;

  // Text displayed to the user.
  title: string;

  // Roles allowed to view this navigation item.
  roles: UserRole[];
}
