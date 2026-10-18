import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { KpiWidgetComponent } from '../../../../shared/components/kpi-widget/kpi-widget.component';
import { ChartCardComponent } from '../../../../shared/components/chart-card/chart-card.component';
import { Kpi, KpiTrend } from '../../../../core/models/kpi.model';

/**
 * @component DashboardPage
 * @description Vista del Dashboard Analítico para Administradores con widgets KPI y ChartCards.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, IonicModule, KpiWidgetComponent, ChartCardComponent],
  template: `
    <ion-header [translucent]="true">
      <ion-toolbar color="primary">
        <ion-buttons slot="start">
          <ion-menu-button></ion-menu-button>
        </ion-buttons>
        <ion-title>Dashboard Analítico</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding page-content">
      <div class="content-container">
        <!-- Encabezado de la página -->
        <div class="section-header">
          <div>
            <h1 class="page-title">Panel de Control Empresarial</h1>
            <p class="page-subtitle">Indicadores clave de rendimiento (KPIs) y analítica en tiempo real.</p>
          </div>
        </div>

        <!-- Grid de Widgets KPI Reutilizables (Fase 2) -->
        <div class="kpi-grid">
          @for (kpi of sampleKpis; track kpi.id) {
            <app-kpi-widget
              [kpi]="kpi"
              [isCurrency]="kpi.unit === 'EUR'"
              (kpiClick)="onKpiSelected($event)"
            ></app-kpi-widget>
          }
        </div>

        <!-- ChartCard Reutilizable (Fase 2) -->
        <div class="charts-section">
          <app-chart-card
            title="Evolución de Ingresos y Facturación"
            subtitle="Análisis comparativo de ingresos por período"
            [timeRanges]="['7D', '30D', '90D', '1A']"
            [selectedTimeRange]="'30D'"
            (timeRangeChange)="onTimeRangeChange($event)"
          >
            <div class="chart-mock-placeholder">
              <ion-icon name="bar-chart-outline" class="chart-icon"></ion-icon>
              <p>Contenedor de gráfico interactivo listo para Chart.js (Fase 3)</p>
            </div>
          </app-chart-card>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .page-content {
      --background: #0f172a;
    }
    .content-container {
      max-width: 1200px;
      margin: 0 auto;
    }
    .section-header {
      margin-bottom: 1.5rem;
      .page-title {
        font-size: 1.6rem;
        font-weight: 700;
        color: #f8fafc;
        margin: 0 0 0.35rem 0;
      }
      .page-subtitle {
        font-size: 0.9rem;
        color: #94a3b8;
        margin: 0;
      }
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.25rem;
      margin-bottom: 2rem;
    }
    .charts-section {
      margin-top: 1.5rem;
    }
    .chart-mock-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1rem;
      color: #94a3b8;
      .chart-icon {
        font-size: 3.5rem;
        color: #6366f1;
        margin-bottom: 0.75rem;
      }
      p {
        font-size: 0.95rem;
        margin: 0;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPage {
  readonly sampleKpis: Kpi[] = [
    {
      id: 'kpi-rev',
      label: 'Ingresos Totales',
      value: 514500,
      previousValue: 462000,
      unit: 'EUR',
      trend: KpiTrend.UP,
      changePercent: 11.4,
      icon: 'cash-outline',
      color: '#10b981'
    },
    {
      id: 'kpi-clients',
      label: 'Nuevos Clientes',
      value: 128,
      previousValue: 110,
      unit: 'clientes',
      trend: KpiTrend.UP,
      changePercent: 16.3,
      icon: 'people-outline',
      color: '#38bdf8'
    },
    {
      id: 'kpi-ret',
      label: 'Tasa de Retención',
      value: 94.2,
      previousValue: 95.1,
      unit: '%',
      trend: KpiTrend.DOWN,
      changePercent: 0.9,
      icon: 'shield-checkmark-outline',
      color: '#f59e0b'
    },
    {
      id: 'kpi-ops',
      label: 'Eficiencia Operativa',
      value: 98.7,
      previousValue: 98.5,
      unit: '%',
      trend: KpiTrend.STABLE,
      changePercent: 0.2,
      icon: 'speedometer-outline',
      color: '#818cf8'
    }
  ];

  onKpiSelected(kpi: Kpi): void {
    console.log('[Dashboard] KPI seleccionado:', kpi);
  }

  onTimeRangeChange(range: string): void {
    console.log('[Dashboard] Rango temporal cambiado:', range);
  }
}
