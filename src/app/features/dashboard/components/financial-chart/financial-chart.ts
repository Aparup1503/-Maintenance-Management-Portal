import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnDestroy,
  ViewChild,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { Chart, ChartConfiguration, registerables } from 'chart.js';

import { FinancialChartData } from '../../../../shared/models/financial-chart-data.model';

Chart.register(...registerables); //--Registers all built-in Chart.js components (controllers, elements, scales, and plugins) so they are available when creating charts.

@Component({
  selector: 'app-financial-chart',
  standalone: true,
  templateUrl: './financial-chart.html',
  styleUrl: './financial-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancialChartComponent implements AfterViewInit {
  readonly chartType = signal<'bar' | 'line'>('bar');

  /**output() allows the child component to notify its parent about events or state changes.
   The parent can decide what action to take when the selected chart type changes.*/
  readonly chartTypeChanged = output<'bar' | 'line'>();

  readonly chartData = input.required<FinancialChartData>();

  //-- Optional configuration input for reusing the component
  //-- with different chart titles.
  readonly title = input('Monthly Financial Overview');

  /**
   * Provides access to the financial chart's canvas element in the component template.
   *
   * ElementRef gives us access to the underlying native HTMLCanvasElement,
   * which is required by Chart.js to initialize and render the chart.
   *
   * --Note: ViewChild is used here for direct DOM/library integration.
   * For regular parent-child component communication, prefer input() and output()
   * to maintain Angular's declarative data flow.
   */
  @ViewChild('financialChart')
  private chartCanvas?: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;
  private readonly destroyRef = inject(DestroyRef);

  /**
   * Synchronizes the Chart.js instance with changes in the chartData input.
   *
   * Whenever the parent component provides new chart data, this effect
   * automatically detects the change and executes again.
   *
   * If the chart instance has already been initialized, update the chart
   * with the latest data to keep the visualization in sync with Angular state.
   *
   * --Note: The chart is initialized separately in ngAfterViewInit().
   * This effect only handles subsequent data updates.
   */
  constructor() {
    //-- React to changes in the chart data.
    effect(() => {
      const data = this.chartData();

      if (this.chart) {
        this.updateChart(data);
      }
    });

    //-- Register cleanup for the Chart.js instance.
    this.destroyRef.onDestroy(() => {
      this.chart?.destroy();
    });

    // afterNextRender(() => {
    //   this.createChart();
    // });
  }

  /**
   * Initializes the chart after Angular has fully initialized the component view.
   * At this point, the @ViewChild canvas element is available for chart rendering.
   */
  ngAfterViewInit(): void {
    this.createChart();
  }

  private createChart(): void {
    if (!this.chartCanvas) {
      return;
    }

    const context = this.chartCanvas.nativeElement.getContext('2d');

    if (!context) {
      return;
    }

    const data = this.chartData();

    const config: ChartConfiguration = {
      type: this.chartType(),

      data: {
        labels: data.labels,

        datasets: [
          {
            label: 'Collection',
            data: data.collection,
          },
          {
            label: 'Expenses',
            data: data.expenses,
          },
          {
            label: 'Balance',
            data: data.balance,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
      },
    };

    this.chart = new Chart(context, config);
  }

  private updateChart(data: FinancialChartData): void {
    if (!this.chart) {
      return;
    }

    this.chart.data.labels = data.labels;

    this.chart.data.datasets[0].data = data.collection;

    this.chart.data.datasets[1].data = data.expenses;

    this.chart.data.datasets[2].data = data.balance;

    this.chart.update();
  }

  setChartType(type: 'bar' | 'line'): void {
    //-- Update the local UI state with the user's selected chart type.
    this.chartType.set(type);

    //-- Notify the parent component about the chart type change.
    this.chartTypeChanged.emit(type);

    //-- Recreate the chart because the chart type is part of
    //-- the Chart.js configuration.
    this.recreateChart();
  }

  private recreateChart(): void {
    //-- Destroy the existing chart instance before creating a new one.
    //-- This prevents multiple Chart.js instances from being attached
    //-- to the same canvas.
    this.chart?.destroy();

    this.chart = undefined;

    this.createChart();
  }

  // ngOnDestroy(): void {
  //   this.chart?.destroy();
  // }
}
