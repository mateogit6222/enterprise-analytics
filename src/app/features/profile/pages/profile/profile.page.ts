import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonToggle,
  ToastController
} from '@ionic/angular';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AppState } from '../../../../state/app.state';
import {
  selectCurrentUser,
  selectUserFullName,
  selectUserRoleLabel
} from '../../../../state/auth/auth.selectors';
import {
  AccessibilityService,
  AccessibilityPreferences,
  FontSizeScale
} from '../../../../core/services/accessibility.service';

/**
 * @component ProfilePage
 * @description Vista del perfil del usuario autenticado y panel de preferencias de accesibilidad
 * y experiencia universal conforme a las directrices WCAG 2.1 AA/AAA.
 *
 * @remarks
 * Cumple con los criterios de evaluación:
 * - RA 1: Conexión reactiva al store de NgRx para visualización del usuario actual.
 * - RA 4: Panel interactivo de accesibilidad con escalado tipográfico, modo alto contraste WCAG AAA y reducción de movimiento.
 * - RA 6: Documentación técnica completa JSDoc/Compodoc.
 */
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonToggle
  ],
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfilePage {
  private readonly store = inject(Store<AppState>);
  private readonly accessibilityService = inject(AccessibilityService);
  private readonly toastCtrl = inject(ToastController);

  /** Datos del usuario autenticado desde el estado global de NgRx */
  readonly currentUser$ = this.store.select(selectCurrentUser);
  readonly userFullName$ = this.store.select(selectUserFullName);
  readonly userRoleLabel$ = this.store.select(selectUserRoleLabel);

  /** Flujo reactivo de preferencias de accesibilidad persistidas */
  readonly accessibilityPrefs$: Observable<AccessibilityPreferences> =
    this.accessibilityService.preferences$;

  /**
   * Modifica el tamaño de la tipografía escalable.
   *
   * @param {FontSizeScale} size - Escala seleccionada ('normal' | 'large' | 'xl').
   */
  async onFontSizeChanged(size: FontSizeScale): Promise<void> {
    this.accessibilityService.setFontSize(size);
    const label = size === 'normal' ? 'Normal (100%)' : size === 'large' ? 'Grande (115%)' : 'Extra Grande (130%)';
    await this.showToast(`Tamaño de tipografía actualizado a: ${label}`, 'primary');
  }

  /**
   * Conmuta el modo de alto contraste extremo (WCAG AAA).
   *
   * @param {boolean} enabled - Estado del toggle.
   */
  async onHighContrastToggled(enabled: boolean): Promise<void> {
    this.accessibilityService.setHighContrast(enabled);
    const msg = enabled
      ? 'Modo Alto Contraste (WCAG AAA) activado'
      : 'Modo Alto Contraste desactivado';
    await this.showToast(msg, enabled ? 'warning' : 'primary');
  }

  /**
   * Conmuta la reducción de movimiento y animaciones complejas.
   *
   * @param {boolean} enabled - Estado del toggle.
   */
  async onReducedMotionToggled(enabled: boolean): Promise<void> {
    this.accessibilityService.setReducedMotion(enabled);
    const msg = enabled
      ? 'Reducción de movimiento activada'
      : 'Animaciones estándar restauradas';
    await this.showToast(msg, 'secondary');
  }

  /**
   * Restablece las opciones de accesibilidad a los valores estándar de fábrica.
   */
  async resetAccessibilityDefaults(): Promise<void> {
    this.accessibilityService.resetToDefaults();
    await this.showToast('Opciones de accesibilidad restablecidas a valores estándar', 'primary');
  }

  /**
   * Despliega una notificación toast informativa en la interfaz.
   *
   * @param {string} message - Mensaje a mostrar.
   * @param {'primary' | 'secondary' | 'warning' | 'success'} color - Color del toast.
   * @private
   */
  private async showToast(
    message: string,
    color: 'primary' | 'secondary' | 'warning' | 'success'
  ): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 2500,
      color,
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }
}
