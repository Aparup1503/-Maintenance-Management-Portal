import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { CurrencyPipe } from '@angular/common';

import { MonthlyFinancialSummary } from '../../../../shared/models/monthly-financial-summary.model';
import { FinancialChartData } from '../../../../shared/models/financial-chart-data.model';
import { FinancialChartComponent } from '../financial-chart/financial-chart';
import { DashboardCardComponent } from '../dashboard-card/dashboard-card';

@Component({
  selector: 'app-monthly-analytics',
  standalone: true,
  imports: [CurrencyPipe, FinancialChartComponent, DashboardCardComponent],
  templateUrl: './monthly-analytics.html',
  styleUrl: './monthly-analytics.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthlyAnalyticsComponent {
  readonly summaries = input.required<MonthlyFinancialSummary[]>();

  readonly chartData = computed<FinancialChartData>(() => {
    const summaries = this.summaries();

    return {
      labels: summaries.map((summary) => summary.month),

      collection: summaries.map((summary) => summary.collection),

      expenses: summaries.map((summary) => summary.expenses),

      balance: summaries.map((summary) => summary.balance),
    };
  });

  onChartTypeChanged(type: 'bar' | 'line'): void {
    //-- This method receives the event emitted by the child component.
    //-- The parent can use this information for analytics,
    //-- user preferences, or coordination with other components.
    console.log('Selected chart type:', type);
  }

  refreshAnalytics(): void {
    //-- This method represents a parent-level action.
    //-- In a real enterprise application, this could trigger
    //-- an API call to reload the latest analytics data.
    console.log('Refreshing financial analytics...');
  }
}
