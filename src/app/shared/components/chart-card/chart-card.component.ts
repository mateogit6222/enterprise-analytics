import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { LoadingSkeletonComponent } from '../loading-skeleton/loading-skeleton.component';

/**
 * @component ChartCardComponent
 * @description Wrapper contenedor reutilizable para gráficos (Chart.js / Canvas) con cabecera
 * configurable, selector de rango temporal interactivo, estado de carga skeleton y accesibilidad.
 *
 * @example
 * ```html
 * <app-chart-card
 *   title="Evolución de Ventas"
 *   subtitle="Comparativa mensual de ingresos acumulados"
 *   [loading]="isLoading$ | async"
 *   [selectedTimeRange]="'30D'"
 *   (timeRangeChange)="onRangeChanged($event)">
 *   <canvas #myChart></canvas>
 * </app-chart-card>
 * ```
 */
@Component({
  selector: 'app-chart-card',
  standalone: true,
  imports: [CommonModule, IonicModule, LoadingSkeletonComponent],
  templateUrl: './chart-card.component.html',
  styleUrls: ['./chart-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartCardComponent {
  /** Título principal del gráfico */
  @Input({ required: true }) title!: string;

  /** Subtítulo descriptivo */
  @Input() subtitle?: string;

  /** Estado de carga que muestra el skeleton */
  @Input() loading: boolean = false;

  /** Opciones de filtros temporales a mostrar en el segmento */
  @Input() timeRanges: string[] = ['7D', '30D', '90D', '1A'];

  /** Rango temporal seleccionado actualmente */
  @Input() selectedTimeRange: string = '30D';

  /** Si es true, renderiza el selector de rango temporal */
  @Input() showTimeFilter: boolean = true;

  /** Icono opcional para un botón de acción secundario (ej. 'download-outline' o 'refresh-outline') */
  @Input() actionIcon?: string;

  /** Tooltip / aria-label para el botón de acción secundario */
  @Input() actionTooltip: string = 'Acción adicional';

  /** Emite el nuevo rango temporal seleccionado */
  @Output() timeRangeChange = new EventEmitter<string>();

  /** Emite el click en el botón de acción secundario */
  @Output() actionClick = new EventEmitter<void>();

  /**
   * Manejador de cambio de rango temporal.
   *
   * @param {string} range - Nuevo rango seleccionado.
   */
  onRangeChange(range: string): void {
    if (this.selectedTimeRange !== range) {
      this.selectedTimeRange = range;
      this.timeRangeChange.emit(range);
    }
  }

  /**
   * Manejador del botón de acción adicional.
   */
  onActionClick(): void {
    this.actionClick.emit();
  }
}
