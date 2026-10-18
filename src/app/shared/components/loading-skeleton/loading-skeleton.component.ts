import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';

/**
 * Tipos de layout soportados por el skeleton loader.
 */
export type SkeletonType = 'table' | 'kpi' | 'chart' | 'card' | 'list';

/**
 * @component LoadingSkeletonComponent
 * @description Componente reutilizable de esqueletos de carga animados (shimmer) para mejorar la UX.
 *
 * @example
 * ```html
 * <app-loading-skeleton type="table" [rows]="5" [columns]="4"></app-loading-skeleton>
 * <app-loading-skeleton type="kpi" [count]="4"></app-loading-skeleton>
 * ```
 */
@Component({
  selector: 'app-loading-skeleton',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './loading-skeleton.component.html',
  styleUrls: ['./loading-skeleton.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSkeletonComponent {
  /** Tipo de esqueleto a renderizar */
  @Input() type: SkeletonType = 'card';

  /** Cantidad de elementos o filas a mostrar */
  @Input() count: number = 3;

  /** Cantidad de columnas (relevante para 'table' y 'kpi') */
  @Input() columns: number = 4;

  /** Texto accesible para lectores de pantalla */
  @Input() ariaLabel: string = 'Cargando contenido...';

  /** Helper para iterar `count` veces en el template */
  get items(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }

  /** Helper para iterar `columns` veces en el template */
  get columnItems(): number[] {
    return Array.from({ length: this.columns }, (_, i) => i);
  }
}
