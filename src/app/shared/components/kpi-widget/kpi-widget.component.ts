import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonSkeletonText, IonIcon } from '@ionic/angular';
import { Kpi, KpiTrend } from '../../../core/models/kpi.model';
import { CurrencyFormatPipe } from '../../pipes/currency-format.pipe';

/**
 * @component KpiWidgetComponent
 * @description Widget estadístico reutilizable para métricas clave de rendimiento con
 * detección de cambios OnPush, indicador visual de tendencia y accesibilidad ARIA completa.
 *
 * @example
 * ```html
 * <app-kpi-widget
 *   [kpi]="revenueKpi"
 *   [isCurrency]="true"
 *   (kpiClick)="onKpiSelected($event)">
 * </app-kpi-widget>
 * ```
 */
@Component({
  selector: 'app-kpi-widget',
  standalone: true,
  imports: [CommonModule, IonSkeletonText, IonIcon, CurrencyFormatPipe],
  templateUrl: './kpi-widget.component.html',
  styleUrls: ['./kpi-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KpiWidgetComponent {
  /** Objeto de datos KPI */
  @Input({ required: true }) kpi!: Kpi;

  /** Si es true, formatea el valor numérico como moneda EUR */
  @Input() isCurrency: boolean = false;

  /** Estado de carga individual del widget */
  @Input() loading: boolean = false;

  /** Emite el evento al hacer click en el widget */
  @Output() kpiClick = new EventEmitter<Kpi>();

  /** Exponer enum KpiTrend al template */
  readonly KpiTrend = KpiTrend;

  /**
   * Manejador del click para emitir el evento si el widget es interactivo.
   */
  onClick(): void {
    if (!this.loading) {
      this.kpiClick.emit(this.kpi);
    }
  }

  /**
   * Genera la descripción accesible para lectores de pantalla.
   */
  get ariaDescription(): string {
    if (!this.kpi) return '';
    const formattedVal = this.isCurrency ? `${this.kpi.value} euros` : `${this.kpi.value} ${this.kpi.unit || ''}`;
    const trendText =
      this.kpi.trend === KpiTrend.UP
        ? `aumento de ${this.kpi.changePercent}%`
        : this.kpi.trend === KpiTrend.DOWN
        ? `descenso de ${this.kpi.changePercent}%`
        : `sin cambios`;

    return `Indicador ${this.kpi.label}: ${formattedVal}, ${trendText} respecto al período anterior.`;
  }
}
