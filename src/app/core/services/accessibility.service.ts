import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Niveles de escala tipográfica disponibles para la aplicación.
 */
export type FontSizeScale = 'normal' | 'large' | 'xl';

/**
 * Configuración completa de preferencias de accesibilidad del usuario.
 */
export interface AccessibilityPreferences {
  fontSize: FontSizeScale;
  highContrast: boolean;
  reducedMotion: boolean;
}

/**
 * @class AccessibilityService
 * @description Servicio centralizado para la gestión y persistencia de preferencias de accesibilidad
 * universal (WCAG 2.1 AA/AAA) en la aplicación Enterprise Analytics.
 *
 * @remarks
 * Controla en tiempo real la manipulación de clases CSS globales en `document.body`:
 * - `.font-size-large`, `.font-size-xl`: escalado de tipografía fluida.
 * - `.high-contrast-mode`: contraste extremo conforme a WCAG AAA (ratios >= 7:1).
 * - `.reduce-motion`: eliminación de animaciones para usuarios con sensibilidad vestibular.
 * Las preferencias se guardan en `localStorage` para persistencia entre sesiones.
 */
@Injectable({
  providedIn: 'root'
})
export class AccessibilityService {
  private readonly STORAGE_KEY = 'ea_accessibility_preferences';

  private readonly preferencesSubject: BehaviorSubject<AccessibilityPreferences>;
  readonly preferences$: Observable<AccessibilityPreferences>;

  constructor() {
    const initialPrefs = this.loadPreferences();
    this.preferencesSubject = new BehaviorSubject<AccessibilityPreferences>(initialPrefs);
    this.preferences$ = this.preferencesSubject.asObservable();
    this.applyPreferences(initialPrefs);
  }

  /**
   * Obtiene la instantánea actual de las preferencias de accesibilidad.
   */
  get currentPreferences(): AccessibilityPreferences {
    return this.preferencesSubject.getValue();
  }

  /**
   * Actualiza el tamaño de la tipografía escalable.
   *
   * @param {FontSizeScale} fontSize - Tamaño seleccionado ('normal' | 'large' | 'xl').
   */
  setFontSize(fontSize: FontSizeScale): void {
    const updated: AccessibilityPreferences = {
      ...this.currentPreferences,
      fontSize
    };
    this.saveAndApply(updated);
  }

  /**
   * Activa o desactiva el modo de alto contraste WCAG AAA.
   *
   * @param {boolean} highContrast - Si es true, activa la paleta de máximo contraste.
   */
  setHighContrast(highContrast: boolean): void {
    const updated: AccessibilityPreferences = {
      ...this.currentPreferences,
      highContrast
    };
    this.saveAndApply(updated);
  }

  /**
   * Activa o desactiva la reducción de animaciones y transiciones.
   *
   * @param {boolean} reducedMotion - Si es true, anula animaciones.
   */
  setReducedMotion(reducedMotion: boolean): void {
    const updated: AccessibilityPreferences = {
      ...this.currentPreferences,
      reducedMotion
    };
    this.saveAndApply(updated);
  }

  /**
   * Restablece todas las opciones de accesibilidad a los valores estándar de fábrica.
   */
  resetToDefaults(): void {
    const defaults: AccessibilityPreferences = {
      fontSize: 'normal',
      highContrast: false,
      reducedMotion: false
    };
    this.saveAndApply(defaults);
  }

  /**
   * Persiste y aplica las preferencias al DOM global.
   * @private
   */
  private saveAndApply(prefs: AccessibilityPreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('[AccessibilityService] No se pudo guardar en localStorage:', e);
    }
    this.preferencesSubject.next(prefs);
    this.applyPreferences(prefs);
  }

  /**
   * Recupera las preferencias almacenadas en localStorage o devuelve los valores por defecto.
   * @private
   */
  private loadPreferences(): AccessibilityPreferences {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('[AccessibilityService] Error al leer de localStorage:', e);
    }

    return {
      fontSize: 'normal',
      highContrast: false,
      reducedMotion: false
    };
  }

  /**
   * Aplica directamente las clases CSS al elemento `document.body` para surtir efecto inmediato.
   * @private
   */
  private applyPreferences(prefs: AccessibilityPreferences): void {
    if (typeof document === 'undefined') return;

    const body = document.body;

    // 1. Escala tipográfica
    body.classList.remove('font-size-large', 'font-size-xl');
    if (prefs.fontSize === 'large') {
      body.classList.add('font-size-large');
    } else if (prefs.fontSize === 'xl') {
      body.classList.add('font-size-xl');
    }

    // 2. Alto contraste WCAG AAA
    if (prefs.highContrast) {
      body.classList.add('high-contrast-mode');
    } else {
      body.classList.remove('high-contrast-mode');
    }

    // 3. Movimiento reducido
    if (prefs.reducedMotion) {
      body.classList.add('reduce-motion');
    } else {
      body.classList.remove('reduce-motion');
    }
  }
}
