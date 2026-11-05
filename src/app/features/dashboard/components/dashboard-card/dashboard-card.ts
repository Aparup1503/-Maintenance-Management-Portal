import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-dashboard-card',
  standalone: true,
  templateUrl: './dashboard-card.html',
  styleUrl: './dashboard-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCardComponent {
  //-- The parent provides the card title.
  //-- This keeps the component reusable across different
  //-- dashboard sections.
  readonly title = input.required<string>();

  //-- An optional subtitle can provide additional context
  //-- without requiring every parent to use it.
  readonly subtitle = input<string>();
}
