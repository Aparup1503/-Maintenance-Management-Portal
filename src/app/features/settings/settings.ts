import { Component, inject } from '@angular/core';

import { UserRoleService } from '../../core/services/user-role.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.html',
  styleUrl: './settings.scss',
})
export class SettingsComponent {
  private readonly userRoleService = inject(UserRoleService);

  readonly isAdmin = this.userRoleService.isAdmin;
}
