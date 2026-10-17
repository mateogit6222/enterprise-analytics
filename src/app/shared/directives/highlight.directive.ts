import {
  Directive,
  ElementRef,
  Input,
  OnChanges,
  Renderer2,
  SecurityContext,
  SimpleChanges,
  inject
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

/**
 * @directive HighlightDirective
 * @description Directiva de atributo para resaltar términos coincidentes de búsqueda dentro de un elemento.
 *
 * Envuelve las coincidencias en elementos `<mark class="highlight-match">` con estilo visual
 * de contraste optimizado y accesible.
 *
 * @example
 * ```html
 * <span [appHighlight]="searchTerm" [highlightText]="record.title"></span>
 * ```
 */
@Directive({
  selector: '[appHighlight]',
  standalone: true
})
export class HighlightDirective implements OnChanges {
  private readonly el = inject(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly sanitizer = inject(DomSanitizer);

  /** Término de búsqueda a resaltar */
  @Input('appHighlight') searchTerm: string = '';

  /** Texto original en el que realizar la búsqueda */
  @Input() highlightText: string = '';

  /** Color personalizado opcional para el resalte */
  @Input() highlightColor: string = 'rgba(99, 102, 241, 0.25)';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] || changes['highlightText']) {
      this.applyHighlight();
    }
  }

  /**
   * Aplica o remueve el resalte en el contenido del elemento.
   */
  private applyHighlight(): void {
    const text = this.highlightText || this.el.nativeElement.textContent || '';
    const query = this.searchTerm ? this.searchTerm.trim() : '';

    if (!query || !text) {
      this.renderer.setProperty(this.el.nativeElement, 'innerHTML', this.escapeHtml(text));
      return;
    }

    /** Escapar caracteres especiales de regex para evitar errores */
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');

    const highlighted = text.replace(
      regex,
      `<mark class="highlight-match" style="background-color: ${this.highlightColor}; color: inherit; padding: 0.1em 0.25em; border-radius: 0.25em; font-weight: 600;">$1</mark>`
    );

    const sanitizedHtml = this.sanitizer.sanitize(SecurityContext.HTML, highlighted) || '';
    this.renderer.setProperty(this.el.nativeElement, 'innerHTML', sanitizedHtml);
  }

  /**
   * Escapa caracteres HTML para prevenir inyecciones.
   */
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
