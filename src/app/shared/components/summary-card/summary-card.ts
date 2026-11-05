import {
  Component,
  input,
  output,
  model,
  ChangeDetectionStrategy,
  ViewEncapsulation,
} from '@angular/core';

import { CurrencyPipe } from '@angular/common';

import { SummaryCardDetails } from '../../models/summary-card.model';

@Component({
  selector: 'app-summary-card',
  imports: [CurrencyPipe],
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.scss',

  changeDetection: ChangeDetectionStrategy.OnPush,

  encapsulation: ViewEncapsulation.Emulated,

  host: {
    class: 'summary-card-host',
    role: 'region',
    '[attr.aria-label]': 'title()',
  },
})
export class SummaryCard {
  // Parent-to-child communication
  title = input.required<string>();
  amount = input.required<number>();
  status = input<string>('normal');

  // Two-way component communication
  selected = model(false);

  // Child-to-parent communication
  cardSelected = output<SummaryCardDetails>();

  onSelectionChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    this.selected.set(checkbox.checked);
  }

  onViewDetails(): void {
    this.selected.set(true);

    this.cardSelected.emit({
      title: this.title(),
      amount: this.amount(),
      status: this.status(),
    });
  }
}
