import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-financial-summary-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './financial-summary-card.html',
  styleUrl: './financial-summary-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialSummaryCardComponent {
  readonly title = input.required<string>();

  readonly amount = input.required<number>();

  readonly description = input<string>('');

  readonly type = input<'income' | 'expense' | 'neutral'>('neutral');
}
