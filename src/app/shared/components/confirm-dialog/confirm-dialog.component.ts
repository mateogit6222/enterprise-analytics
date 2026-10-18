import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostListener,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular/lazy';
import { ModalController } from '@ionic/angular/lazy';

/**
 * Variantes visuales para el diálogo de confirmación.
 */
export type DialogVariant = 'danger' | 'warning' | 'primary';

/**
 * @component ConfirmDialogComponent
 * @description Modal de confirmación genérico reutilizable con soporte ARIA, animación fluida
 * y compatibilidad dual (tanto como componente embebido como a través de `ModalController`).
 *
 * @example
 * ```typescript
 * const modal = await this.modalCtrl.create({
 *   component: ConfirmDialogComponent,
 *   componentProps: {
 *     title: 'Eliminar Registro',
 *     message: '¿Estás seguro de eliminar este registro? Esta acción no se puede deshacer.',
 *     confirmText: 'Eliminar',
 *     variant: 'danger'
 *   }
 * });
 * await modal.present();
 * const { data } = await modal.onWillDismiss();
 * if (data?.confirmed) {
 *   // Proceder
 * }
 * ```
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfirmDialogComponent {
  private readonly modalCtrl = inject(ModalController, { optional: true });

  /** Título del diálogo */
  @Input() title: string = 'Confirmar acción';

  /** Mensaje descriptivo */
  @Input() message: string = '¿Estás seguro de que deseas realizar esta acción?';

  /** Información adicional o advertencia secundaria */
  @Input() details?: string;

  /** Texto del botón de confirmación */
  @Input() confirmText: string = 'Confirmar';

  /** Texto del botón de cancelación */
  @Input() cancelText: string = 'Cancelar';

  /** Icono de Ionicons a mostrar en la cabecera */
  @Input() icon: string = 'alert-circle-outline';

  /** Variante temática que define el color semántico */
  @Input() variant: DialogVariant = 'danger';

  /** Evento emitido al confirmar */
  @Output() confirmed = new EventEmitter<boolean>();

  /** Evento emitido al cancelar */
  @Output() cancelled = new EventEmitter<void>();

  /**
   * Cierra con la tecla ESC para accesibilidad WCAG.
   */
  @HostListener('keydown.escape')
  onEscape(): void {
    this.onCancel();
  }

  /**
   * Ejecuta la acción de confirmación.
   */
  onConfirm(): void {
    this.confirmed.emit(true);
    if (this.modalCtrl) {
      this.modalCtrl.dismiss({ confirmed: true }, 'confirm');
    }
  }

  /**
   * Cancela y descarta el diálogo.
   */
  onCancel(): void {
    this.cancelled.emit();
    if (this.modalCtrl) {
      this.modalCtrl.dismiss({ confirmed: false }, 'cancel');
    }
  }
}
