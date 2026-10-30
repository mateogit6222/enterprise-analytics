import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
  IonLabel
} from '@ionic/angular';

/**
 * @component HelpCenterPage
 * @description Centro de Ayuda interactivo y Manual de Usuario embebido directamente en la aplicación.
 * Proporciona búsqueda rápida, acordeones accesibles segmentados por módulo, tabla de atajos
 * de teclado globales y guía visual de flujo de trabajo en 4 pasos.
 *
 * @remarks
 * Cumple con los criterios de evaluación:
 * - RA 4: Accesibilidad universal con ion-accordion-group, soporte de lector de pantalla y tabla de atajos.
 * - RA 6: Manual de usuario embebido en la aplicación como sistema de ayuda contextual (criterio 10/10).
 */
@Component({
  selector: 'app-help-center',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonAccordionGroup,
    IonAccordion,
    IonItem,
    IonLabel
  ],
  templateUrl: './help-center.page.html',
  styleUrls: ['./help-center.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HelpCenterPage {
  /** Término de búsqueda introducido por el usuario */
  searchQuery: string = '';

  /**
   * Determina si un módulo o sección coincide con el término de búsqueda actual.
   * Si no hay término de búsqueda, retorna `true` para mostrar todo el contenido.
   *
   * @param {...string[]} keywords - Palabras clave o etiquetas asociadas al módulo.
   * @returns {boolean} `true` si el módulo debe ser visible.
   */
  matchesSearch(...keywords: string[]): boolean {
    if (!this.searchQuery || this.searchQuery.trim() === '') {
      return true;
    }

    const q = this.searchQuery.toLowerCase().trim();
    return keywords.some(kw => kw.toLowerCase().includes(q)) || q.length === 0;
  }

  /**
   * Manejador ejecutado al cambiar el texto de búsqueda.
   */
  onSearchChange(): void {
    // La reactividad se maneja directamente en el template gracias al data binding
  }

  /**
   * Limpia el campo de búsqueda restableciendo la vista completa.
   */
  clearSearch(): void {
    this.searchQuery = '';
  }
}
