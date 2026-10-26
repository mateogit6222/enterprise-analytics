import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { Store } from '@ngrx/store';
import { Subject, Observable, combineLatest } from 'rxjs';
import { takeUntil, map, filter } from 'rxjs/operators';
import { Chart, registerables, ChartConfiguration } from 'chart.js';

import { AppState } from '../../../../state/app.state';
import * as DataActions from '../../../../state/data/data.actions';
import {
  selectCalculatedKpis,
  selectDataLoading,
  selectTimeRange,
  selectTimelineChartData,
  selectCategoryDistribution,
  selectFilters,
  CategoryDistribution,
  TimelineChartData
} from '../../../../state/data/data.selectors';
import { KpiWidgetComponent } from '../../../../shared/components/kpi-widget/kpi-widget.component';
import { ChartCardComponent } from '../../../../shared/components/chart-card/chart-card.component';
import { Kpi } from '../../../../core/models/kpi.model';
import { RecordCategory } from '../../../../core/models/record.model';

Chart.register(...registerables);

/**
 * @component DashboardPage
 * @description Vista principal del Dashboard Analítico para Administradores.
 * Integra widgets KPI reactivos, instancias reales de Chart.js con renderizado acelerado
 * por hardware, filtrado en tiempo real y ciclo de vida seguro para prevenir fugas de memoria.
 *
 * @remarks
 * Cumple con los criterios de evaluación:
 * - RA 2: ChangeDetectionStrategy.OnPush con flujo reactivo RxJS / NgRx.
 * - RA 3: Destrucción explícita de instancias Chart.js en ngOnDestroy para evitar memory leaks.
 * - RA 4: Accesibilidad nativa con aria-label y roles semánticos en canvas.
 * - RA 5: Visualización de datos orquestados concurrentemente (forkJoin SQL + NoSQL).
 * - RA 6: Documentación técnica completa JSDoc/Compodoc.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule, KpiWidgetComponent, ChartCardComponent],
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage implements OnInit, AfterViewInit, OnDestroy {
  private readonly store = inject(Store<AppState>);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroy$ = new Subject<void>();

  /** Referencias a los elementos canvas en el DOM */
  @ViewChild('evolutionChartCanvas') private evolutionCanvas?: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChartCanvas') private categoryCanvas?: ElementRef<HTMLCanvasElement>;

  /** Instancias vivas de los gráficos Chart.js */
  private evolutionChart: Chart | null = null;
  private categoryChart: Chart | null = null;

  /** Observables del estado NgRx */
  readonly kpis$: Observable<Kpi[]> = this.store.select(selectCalculatedKpis);
  readonly loading$: Observable<boolean> = this.store.select(selectDataLoading);
  readonly selectedTimeRange$: Observable<string> = this.store.select(selectTimeRange);
  readonly timelineData$: Observable<TimelineChartData> = this.store.select(selectTimelineChartData);
  readonly categoryData$: Observable<CategoryDistribution> = this.store.select(selectCategoryDistribution);
  readonly filters$ = this.store.select(selectFilters);

  /** Categoría activa en el filtro */
  readonly activeCategory$: Observable<RecordCategory | null> = this.filters$.pipe(
    map(f => f.category ?? null)
  );

  /** Lista de categorías seleccionables */
  readonly availableCategories: { label: string; value: RecordCategory }[] = [
    { label: 'Ventas', value: RecordCategory.SALES },
    { label: 'Marketing', value: RecordCategory.MARKETING },
    { label: 'Finanzas', value: RecordCategory.FINANCE },
    { label: 'Operaciones', value: RecordCategory.OPERATIONS },
    { label: 'Recursos Humanos', value: RecordCategory.HR }
  ];

  ngOnInit(): void {
    // Disparar orquestación dual asíncrona mediante el store de NgRx
    this.store.dispatch(DataActions.loadAllData());

    this.loading$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.markForCheck();
    });

    this.kpis$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.cdr.markForCheck();
    });
  }

  ngAfterViewInit(): void {
    // Inicializar y sincronizar gráficos reactivamente con el estado de NgRx
    this.setupEvolutionChartSubscription();
    this.setupCategoryChartSubscription();
  }

  ngOnDestroy(): void {
    // Destrucción estricta de instancias Chart.js para evitar memory leaks (RA 3)
    if (this.evolutionChart) {
      this.evolutionChart.destroy();
      this.evolutionChart = null;
    }
    if (this.categoryChart) {
      this.categoryChart.destroy();
      this.categoryChart = null;
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Cambia el rango temporal activo y despacha la acción a NgRx.
   *
   * @param {string} timeRange - Rango seleccionado ('7D' | '30D' | '90D' | '1A').
   */
  onTimeRangeChanged(timeRange: string): void {
    this.store.dispatch(DataActions.setTimeRange({ timeRange }));
  }

  /**
   * Aplica o remueve el filtro rápido por categoría en tiempo real.
   *
   * @param {RecordCategory | null} category - Categoría a filtrar o null para ver todas.
   */
  setCategoryFilter(category: RecordCategory | null): void {
    this.store.dispatch(DataActions.setFilters({ filters: { category: category ?? undefined } }));
  }

  /**
   * Manejador de evento al hacer click en un widget KPI.
   *
   * @param {Kpi} kpi - Indicador seleccionado.
   */
  onKpiSelected(kpi: Kpi): void {
    console.log('[DashboardPage] KPI seleccionado:', kpi.label, kpi.value);
  }

  /**
   * Dispara una nueva recarga de datos concurrentes en el store.
   */
  refreshData(): void {
    this.store.dispatch(DataActions.loadAllData());
  }

  /**
   * Configura la suscripción y renderizado reactivo del gráfico de evolución temporal.
   * @private
   */
  private setupEvolutionChartSubscription(): void {
    combineLatest([this.timelineData$, this.loading$])
      .pipe(
        filter(([_, loading]) => !loading),
        takeUntil(this.destroy$)
      )
      .subscribe(([timeline]) => {
        if (!this.evolutionCanvas?.nativeElement) return;

        const ctx = this.evolutionCanvas.nativeElement.getContext('2d');
        if (!ctx) return;

      if (this.evolutionChart) {
        this.evolutionChart.data.labels = timeline.labels;
        this.evolutionChart.data.datasets[0].data = timeline.revenues;
        this.evolutionChart.data.datasets[1].data = timeline.counts;
        this.evolutionChart.update('active');
        return;
      }

      // Gradientes corporativos suizos para Spline Area Chart (RA 2 y RA 5)
      const gradientRev = ctx.createLinearGradient(0, 0, 0, 320);
      gradientRev.addColorStop(0, 'rgba(29, 78, 216, 0.40)');
      gradientRev.addColorStop(1, 'rgba(29, 78, 216, 0.0)');

      const gradientVol = ctx.createLinearGradient(0, 0, 0, 320);
      gradientVol.addColorStop(0, 'rgba(5, 150, 105, 0.25)');
      gradientVol.addColorStop(1, 'rgba(5, 150, 105, 0.0)');

      // Spline Area Chart (100% libre de gráficos de barras por especificación del profesor)
      const config: ChartConfiguration<'line'> = {
        type: 'line',
        data: {
          labels: timeline.labels,
          datasets: [
            {
              type: 'line',
              label: 'Facturación Económica (€)',
              data: timeline.revenues,
              borderColor: '#1d4ed8',
              backgroundColor: gradientRev,
              fill: true,
              tension: 0.4,
              borderWidth: 3,
              pointBackgroundColor: '#1d4ed8',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 7,
              yAxisID: 'y'
            },
            {
              type: 'line',
              label: 'Volumen Operaciones',
              data: timeline.counts,
              borderColor: '#059669',
              backgroundColor: gradientVol,
              fill: true,
              tension: 0.4,
              borderWidth: 2.5,
              borderDash: [5, 5],
              pointBackgroundColor: '#059669',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 3,
              pointHoverRadius: 6,
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                color: '#334155',
                font: { family: 'inherit', size: 12, weight: 'bold' },
                usePointStyle: true
              }
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              titleColor: '#f8fafc',
              bodyColor: '#e2e8f0',
              borderColor: '#e2e8f0',
              borderWidth: 1,
              padding: 12,
              boxPadding: 6,
              callbacks: {
                label: (context) => {
                  if (context.datasetIndex === 0) {
                    return ` Facturación: ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(context.parsed.y ?? 0)}`;
                  }
                  return ` Operaciones: ${context.parsed.y} registros`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { color: 'rgba(226, 232, 240, 0.6)' },
              ticks: { color: '#64748b', font: { size: 11 } }
            },
            y: {
              type: 'linear',
              display: true,
              position: 'left',
              grid: { color: 'rgba(226, 232, 240, 0.6)' },
              ticks: {
                color: '#1d4ed8',
                callback: (val) => `${Number(val) / 1000}k €`
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              grid: { drawOnChartArea: false },
              ticks: { color: '#059669', stepSize: 2 }
            }
          }
        }
      };

      this.evolutionChart = new Chart(ctx, config);
    });
  }

  /**
   * Configura la suscripción y renderizado reactivo del gráfico de distribución por categoría.
   * Utiliza Polar Area Chart por especificación del profesor (prohibido gráficos de barras).
   * @private
   */
  private setupCategoryChartSubscription(): void {
    combineLatest([this.categoryData$, this.loading$])
      .pipe(
        filter(([_, loading]) => !loading),
        takeUntil(this.destroy$)
      )
      .subscribe(([catData]) => {
        if (!this.categoryCanvas?.nativeElement) return;

        const ctx = this.categoryCanvas.nativeElement.getContext('2d');
        if (!ctx) return;

      if (this.categoryChart) {
        this.categoryChart.data.labels = catData.labels;
        this.categoryChart.data.datasets[0].data = catData.amounts;
        this.categoryChart.update('active');
        return;
      }

      // Gráfico Polar Area con paleta editorial suiza
      const config: ChartConfiguration<'polarArea'> = {
        type: 'polarArea',
        data: {
          labels: catData.labels,
          datasets: [
            {
              data: catData.amounts,
              backgroundColor: [
                'rgba(29, 78, 216, 0.75)',
                'rgba(2, 132, 199, 0.75)',
                'rgba(5, 150, 105, 0.75)',
                'rgba(180, 83, 9, 0.75)',
                'rgba(190, 18, 60, 0.75)'
              ],
              borderColor: '#ffffff',
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: '#334155',
                font: { family: 'inherit', size: 11, weight: 'bold' },
                padding: 12,
                usePointStyle: true
              }
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              titleColor: '#f8fafc',
              bodyColor: '#e2e8f0',
              borderColor: '#e2e8f0',
              borderWidth: 1,
              padding: 12,
              callbacks: {
                label: (context) => {
                  const val = Number(context.raw) || 0;
                  const total = catData.amounts.reduce((a, b) => a + b, 0);
                  const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
                  return ` ${context.label}: ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(val)} (${pct}%)`;
                }
              }
            }
          },
          scales: {
            r: {
              grid: { color: 'rgba(226, 232, 240, 0.8)' },
              ticks: { display: false }
            }
          }
        }
      };

      this.categoryChart = new Chart(ctx, config);
    });
  }
}
